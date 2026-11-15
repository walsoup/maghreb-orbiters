import { LM, CORE } from "./config.mjs";

export function angleDeg(a, b, c, W, H) {
  const ax=(a.x-b.x)*W, ay=(a.y-b.y)*H, cx=(c.x-b.x)*W, cy=(c.y-b.y)*H;
  const d = (ax*cx+ay*cy) / (Math.hypot(ax,ay)*Math.hypot(cx,cy) + 1e-9);
  return Math.acos(Math.max(-1, Math.min(1, d))) * 180/Math.PI;
}
export const dist = (a, b, W, H) => Math.hypot((a.x-b.x)*W, (a.y-b.y)*H);
export const visOK = lm => CORE.every(i => (lm[i].visibility ?? 1) > 0.4);

// joint angles (aspect-corrected)
export function computeAngles(lm, W, H) {
  return {
    lKnee: angleDeg(lm[LM.lHip], lm[LM.lKnee], lm[LM.lAnkle], W, H), rKnee: angleDeg(lm[LM.rHip], lm[LM.rKnee], lm[LM.rAnkle], W, H),
    lElbow: angleDeg(lm[LM.lShoulder], lm[LM.lElbow], lm[LM.lWrist], W, H), rElbow: angleDeg(lm[LM.rShoulder], lm[LM.rElbow], lm[LM.rWrist], W, H)
  };
}
