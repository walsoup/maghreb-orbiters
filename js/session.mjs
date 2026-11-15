import { KEY_JOINTS, MIN_ROM_FOR_REPS, MIN_REP_CYCLE, CH_WINDOW,
         MIN_DETECTED_FRAMES, MIN_QUALITY_PERCENT, MIN_SESSION_SECONDS } from "./config.mjs";
import { dist } from "./geometry.mjs";

export function createSession() {
  return { t0:null, tEnd:0, frames:0, detected:0,
        prev:null, prevT:0, prevVel:null,
        energySum:0, energyN:0, accSum:0, accN:0,
        rom: { lKnee:[999,0], rKnee:[999,0], lElbow:[999,0], rElbow:[999,0] },
        reps: { knee:{n:0, st:"ext", lastT:0, lastFlip:0}, elbow:{n:0, st:"ext", lastT:0, lastFlip:0} },
        smAng: null, angLo: { knee:999, elbow:999 }, angHi: { knee:0, elbow:0 }, durSum:0,
        repTimes: [],        // {t, kind}
        asymSum:0, asymN:0,
        hist: [],            // {t, lKnee, rKnee, lElbow, rElbow}
        trails: { lw:[], rw:[], la:[], ra:[] } };
}

export function repTick(S, kind, ang, t) {
  const lo = S.angLo[kind], hi = S.angHi[kind];
  if (hi - lo < MIN_ROM_FOR_REPS) return;
  const flex = lo + 0.25 * (hi - lo), ext = hi - 0.25 * (hi - lo);
  const r = S.reps[kind];
  if (r.st === "ext" && ang < flex) {
    if (t - r.lastFlip >= MIN_REP_CYCLE) { r.st = "flex"; r.lastFlip = t; }
  } else if (r.st === "flex" && ang > ext) {
    if (t - r.lastFlip >= MIN_REP_CYCLE) {
      r.st = "ext"; r.n++; r.lastFlip = t;
      if (r.lastT) S.tempoLast = t - r.lastT;
      r.lastT = t; S.repTimes.push({t, kind});
    }
  }
}

// Per-frame session metrics: ROM, history, smoothed rep detection,
// symmetry, movement energy/smoothness. Mutates and returns S.
export function updateSession(S, lm, ang, t, W, H) {
  for (const k in ang) { const r = S.rom[k]; if (ang[k] < r[0]) r[0] = ang[k]; if (ang[k] > r[1]) r[1] = ang[k]; }
  S.hist.push({ t, ...ang }); while (S.hist.length && S.hist[0].t < t - CH_WINDOW) S.hist.shift();

  // reps from average side angles, EMA-smoothed to reject landmark jitter
  if (!S.smAng) S.smAng = { knee:(ang.lKnee+ang.rKnee)/2, elbow:(ang.lElbow+ang.rElbow)/2 };
  const A = 0.35;
  S.smAng.knee  += A * ((ang.lKnee  + ang.rKnee ) / 2 - S.smAng.knee);
  S.smAng.elbow += A * ((ang.lElbow + ang.rElbow) / 2 - S.smAng.elbow);
  // keep the observed range per channel, then rep-detect within it
  for (const k of ["knee", "elbow"]) {
    if (S.smAng[k] < S.angLo[k]) S.angLo[k] = S.smAng[k];
    if (S.smAng[k] > S.angHi[k]) S.angHi[k] = S.smAng[k];
    repTick(S, k, S.smAng[k], t);
  }
  // symmetry: mean |left - right| over knee+elbow
  S.asymSum += (Math.abs(ang.lKnee - ang.rKnee) + Math.abs(ang.lElbow - ang.rElbow)) / 2; S.asymN++;

  // movement energy: mean landmark speed normalized to torso length; smoothness from acceleration
  const sh = { x:(lm[11].x+lm[12].x)/2, y:(lm[11].y+lm[12].y)/2 };
  const torso = Math.max(20, dist(sh, { x:(lm[23].x+lm[24].x)/2, y:(lm[23].y+lm[24].y)/2 }, W, H));
  if (S.prev) {
    const dt = Math.max(1/120, t - S.prevT);
    let vSum = 0;
    const vel = KEY_JOINTS.map(i => {
      const v = Math.min(4, Math.hypot(lm[i].x - S.prev[i].x, lm[i].y - S.prev[i].y) * H / torso / dt);
      vSum += v; return v;
    });
    S.energySum += vSum / KEY_JOINTS.length; S.energyN++;
    if (S.prevVel) {
      let aSum = 0; for (let i = 0; i < vel.length; i++) aSum += Math.abs(vel[i] - S.prevVel[i]);
      S.accSum += aSum / vel.length / dt; S.accN++;
    }
    S.prevVel = vel;
  }
  S.prev = lm.map(p => ({x:p.x, y:p.y})); S.prevT = t;
  return S;
}

export function sessionStats(S) {
  if (!S || S.detected < MIN_DETECTED_FRAMES) return null;
  const quality = S.detected / Math.max(1, S.frames);
  const dur = S.durSum;
  const rom = {}; for (const k in S.rom) rom[k] = Math.round(Math.max(0, S.rom[k][1] - S.rom[k][0]));
  const energy = S.energyN ? S.energySum / S.energyN : 0;
  const smooth = S.accN ? Math.max(0, 100 - (S.accSum / S.accN) * 8) : 0;
  const asym = S.asymN ? S.asymSum / S.asymN : 0;
  return { quality, dur, rom, energy, smooth, asym,
           reps: { knee: S.reps.knee.n, elbow: S.reps.elbow.n } };
}

export function evaluateSessionGate(m) {
  const q = Math.round(m.quality * 100);
  return { q, scorable: !(q < MIN_QUALITY_PERCENT || m.dur < MIN_SESSION_SECONDS) };
}
