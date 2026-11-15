export const CDN = {
  js:    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs",
  wasm:  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
  model: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task"
};
// Optional local runtime/model fallback. These must resolve at the project
// root, not the js directory: the import specifier is relative to this
// module (js/), while the wasm/model paths are resolved against the page,
// exactly as in the original single-file app.
export const LOCAL_JS = "../vision_bundle.mjs";
export const LOCAL_WASM = "./";
export const LOCAL_MODEL = "./pose_landmarker_full.task";
export const SAMPLE_VIDEO = "astro-motion.mp4";
export const STORAGE_KEY = "orbiter.lastSession";

export const LM = { lShoulder:11, rShoulder:12, lElbow:13, rElbow:14, lWrist:15, rWrist:16,
             lHip:23, rHip:24, lKnee:25, rKnee:26, lAnkle:27, rAnkle:28 };
export const BONES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],
               [23,25],[25,27],[24,26],[26,28],[27,31],[28,32],[15,19],[16,20]];
export const KEY_JOINTS = [11,12,13,14,15,16,23,24,25,26,27,28];
export const CORE = [11,12,13,14,15,16,23,24,25,26];
// rep detection auto-calibrates to the observed range of motion:
// gates sit at 25% / 75% of the smoothed signal's own min-max window,
// so it works across exercises and camera setups without hand-tuned angles.
export const MIN_ROM_FOR_REPS = 15;   // degrees of observed swing before counting
export const MIN_REP_CYCLE = 0.7;     // seconds; no human moves faster than this
export const CH_WINDOW = 30; // seconds of history on the chart
// session report gate (see report.mjs): refuse to score bad sessions
export const MIN_DETECTED_FRAMES = 5;
export const MIN_QUALITY_PERCENT = 50;
export const MIN_SESSION_SECONDS = 15;
