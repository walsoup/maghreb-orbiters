import test from "node:test";
import assert from "node:assert/strict";
import { createSession, sessionStats, evaluateSessionGate } from "../js/session.mjs";
import { MIN_QUALITY_PERCENT, MIN_SESSION_SECONDS } from "../js/config.mjs";

test("gate thresholds remain 50% quality and 15 seconds", () => {
  assert.equal(MIN_QUALITY_PERCENT, 50);
  assert.equal(MIN_SESSION_SECONDS, 15);
});

test("sessionStats: null when fewer than 5 frames were detected", () => {
  const S = createSession();
  S.detected = 4; S.frames = 4;
  assert.equal(sessionStats(S), null);
  assert.equal(sessionStats(null), null);
});

test("sessionStats: derives quality, duration, ROM and rep counts", () => {
  const S = createSession();
  S.frames = 100; S.detected = 80; S.durSum = 42;
  S.rom.lKnee = [40, 175]; S.rom.rKnee = [50, 170];
  S.reps.knee.n = 7; S.reps.elbow.n = 3;
  const m = sessionStats(S);
  assert.equal(m.quality, 0.8);
  assert.equal(m.dur, 42);
  assert.equal(m.rom.lKnee, 135);
  assert.equal(m.rom.rKnee, 120);
  assert.deepEqual(m.reps, { knee: 7, elbow: 3 });
});

test("evaluateSessionGate: boundary values pass, below-threshold fails", () => {
  assert.deepEqual(evaluateSessionGate({ quality: 0.5, dur: 15 }), { q: 50, scorable: true });
  assert.equal(evaluateSessionGate({ quality: 0.49, dur: 60 }).scorable, false);
  assert.equal(evaluateSessionGate({ quality: 1, dur: 14.9 }).scorable, false);
  assert.equal(evaluateSessionGate({ quality: 0.9, dur: 20 }).scorable, true);
});
