import test from "node:test";
import assert from "node:assert/strict";
import { createSession, repTick, updateSession } from "../js/session.mjs";

function rangedSession() {
  const S = createSession();
  S.angLo.knee = 40; S.angHi.knee = 170; // flex gate 72.5, ext gate 137.5
  return S;
}

test("repTick: full ext->flex->ext cycle counts one rep, then repeats", () => {
  const S = rangedSession();
  repTick(S, "knee", 170, 0);
  assert.equal(S.reps.knee.n, 0);
  repTick(S, "knee", 60, 1); // crosses flex gate
  assert.equal(S.reps.knee.st, "flex");
  assert.equal(S.reps.knee.n, 0);
  repTick(S, "knee", 150, 2); // crosses ext gate -> rep
  assert.equal(S.reps.knee.n, 1);
  assert.deepEqual(S.repTimes, [{ t: 2, kind: "knee" }]);
  repTick(S, "knee", 60, 3);
  repTick(S, "knee", 150, 4);
  assert.equal(S.reps.knee.n, 2);
  assert.equal(S.tempoLast, 2); // 4 - 2 seconds per rep
});

test("repTick: no counting below the 15 degree ROM gate", () => {
  const S = createSession();
  S.angLo.knee = 100; S.angHi.knee = 110; // 10 degrees < MIN_ROM_FOR_REPS
  repTick(S, "knee", 100, 1);
  repTick(S, "knee", 110, 2);
  assert.equal(S.reps.knee.n, 0);
  assert.equal(S.reps.knee.st, "ext");
});

test("repTick: flips faster than MIN_REP_CYCLE (0.7s) are rejected", () => {
  const S = rangedSession();
  repTick(S, "knee", 60, 0.3); // 0.3s after lastFlip=0, too fast
  assert.equal(S.reps.knee.st, "ext");
  repTick(S, "knee", 60, 1);
  assert.equal(S.reps.knee.st, "flex");
  repTick(S, "knee", 150, 1.3); // too fast to complete the cycle
  assert.equal(S.reps.knee.n, 0);
  repTick(S, "knee", 150, 2);
  assert.equal(S.reps.knee.n, 1);
});

test("updateSession: smoothed swinging knee counts reps end to end", () => {
  const S = createSession();
  const lm = Array.from({ length: 33 }, (_, i) => ({ x: i / 100, y: i / 100, visibility: 1 }));
  const frame = (knee, elbow, t) =>
    updateSession(S, lm, { lKnee: knee, rKnee: knee, lElbow: elbow, rElbow: elbow }, t, 640, 360);
  // 1s phases at 10 fps: extended, flexed, extended, flexed, extended
  const phases = [170, 50, 170, 50, 170];
  phases.forEach((knee, p) => {
    for (let f = 0; f < 10; f++) frame(knee, 170, p + f / 10);
  });
  assert.equal(S.reps.knee.n, 2);
  assert.equal(S.reps.elbow.n, 0);
  assert.equal(S.repTimes.length, 2);
  assert.ok(S.hist.length > 0);
});
