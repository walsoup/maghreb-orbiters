import { CDN, LOCAL_JS, LOCAL_WASM, LOCAL_MODEL } from "./config.mjs";

// Loads the MediaPipe Pose Landmarker, preferring the optional local
// runtime/model at the project root and falling back to the CDN.
// No DOM access here; the caller updates status/buttons. Throws on failure.
export async function createPoseLandmarker() {
  let mod, wasmPath, modelPath;
  if (location.protocol !== "file:") {
    try { mod = await import(LOCAL_JS); wasmPath = LOCAL_WASM; modelPath = LOCAL_MODEL; }
    catch (e) { mod = null; }
  }
  if (!mod) { mod = await import(CDN.js); wasmPath = CDN.wasm; modelPath = CDN.model; }
  const fileset = await mod.FilesetResolver.forVisionTasks(wasmPath);
  const opts = delegate => ({ baseOptions:{ modelAssetPath:modelPath, delegate }, runningMode:"VIDEO", numPoses:1 });
  try { return await mod.PoseLandmarker.createFromOptions(fileset, opts("GPU")); }
  catch (e) { return await mod.PoseLandmarker.createFromOptions(fileset, opts("CPU")); }
}
