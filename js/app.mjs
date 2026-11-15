import { SAMPLE_VIDEO } from "./config.mjs";
import { visOK, computeAngles } from "./geometry.mjs";
import { createSession, updateSession } from "./session.mjs";
import { createPoseLandmarker } from "./pose-engine.mjs";
import { drawSkeleton, drawAngleArc, drawChart } from "./render.mjs";
import { endSession } from "./report.mjs";

const $ = id => document.getElementById(id);
const video = $("video"), overlay = $("overlay"), og = overlay.getContext("2d");
const chart = $("chart"), cg = chart.getContext("2d");
const statusEl = $("status"), hud = $("hud"), trackEl = $("track");

let pose = null, camStream = null, camMode = false, rafId = 0, S = null;
const getS = () => S;
const getPose = () => pose;

async function loadEngine() {
  try {
    pose = await createPoseLandmarker();
    for (const id of ["b-sample", "b-cam", "b-upload"]) $(id).disabled = false;
    statusEl.textContent = "Pose engine ready - pick a video source. Everything runs on this device.";
  } catch (e) {
    statusEl.textContent = "Could not load the pose engine (needs the bundled model files or an internet connection).";
  }
}

function processResult(res, t) {
  const W = video.videoWidth || 640, H = video.videoHeight || 360;
  if (overlay.width !== video.clientWidth) { overlay.width = video.clientWidth; overlay.height = video.clientHeight; }
  og.clearRect(0,0,overlay.width,overlay.height);
  S.frames++;
  const lm = res.landmarks && res.landmarks[0];
  if (!lm) { trackEl.textContent = "LOST"; trackEl.style.color = "#ff6b81"; S.prev = null; S.prevVel = null; return; }
  const ok = visOK(lm);
  trackEl.textContent = ok ? "TRACKING" : "PARTIAL";
  trackEl.style.color = ok ? "#4ef0c8" : "#ffb84d";
  S.detected++;
  if (S.t0 === null) S.t0 = t;
  if (S.prevT && t > S.prevT) S.durSum += Math.min(0.5, t - S.prevT);
  S.tEnd = t;

  drawSkeleton(og, overlay, S.trails, lm, W, H, ok);

  // joint angles (aspect-corrected)
  const ang = computeAngles(lm, W, H);
  drawAngleArc(og, overlay, lm, 23, 25, 27, W, H, Math.round(ang.lKnee) + "°");
  drawAngleArc(og, overlay, lm, 12, 14, 16, W, H, Math.round(ang.rElbow) + "°");

  updateSession(S, lm, ang, t, W, H);

  // HUD + rail
  hud.textContent = `knee L ${Math.round(ang.lKnee)}°  R ${Math.round(ang.rKnee)}°\nelbow L ${Math.round(ang.lElbow)}°  R ${Math.round(ang.rElbow)}°`;
  $("r-squat").textContent = S.reps.knee.n; $("r-arm").textContent = S.reps.elbow.n;
  const e = S.energyN ? S.energySum / S.energyN : 0;
  $("m-energy").textContent = e.toFixed(2); $("g-energy").style.width = Math.min(100, e / 2.2 * 100) + "%";
  const asym = S.asymN ? S.asymSum / S.asymN : 0;
  const sym = Math.max(0, 100 - asym * 2);
  $("m-sym").textContent = Math.round(sym) + "%"; $("g-sym").style.width = sym + "%";
  $("m-tempo").textContent = S.tempoLast ? S.tempoLast.toFixed(1) + " s/rep" : "-";
  const el = S.durSum; $("m-clock").textContent = `${Math.floor(el/60)}:${String(Math.floor(el%60)).padStart(2,"0")}`;

  drawChart(cg, chart, S, t);
}

function loop() {
  if (video.readyState >= 2 && pose && S) {
    const t = video.currentTime;
    if (t - loop._lt >= 1/30) { loop._lt = t; pose.detectForVideo(video, performance.now(), r => processResult(r, t)); }
  }
  rafId = requestAnimationFrame(loop);
}

function startSession() {
  S = createSession(); loop._lt = -1e9;
  $("r-squat").textContent = "0"; $("r-arm").textContent = "0";
  $("m-energy").textContent = "-"; $("g-energy").style.width = "0%";
  $("m-sym").textContent = "-"; $("g-sym").style.width = "0%";
  $("m-tempo").textContent = "-"; $("m-clock").textContent = "0:00";
  hud.textContent = "";
  $("b-stop").style.display = "";
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}
function stopStream() {
  cancelAnimationFrame(rafId); rafId = 0;
  if (camStream) { camStream.getTracks().forEach(tr => tr.stop()); camStream = null; }
  video.pause(); video.removeAttribute("src"); video.load();
}

$("b-sample").onclick = () => {
  if (!pose) return;
  stopStream(); camMode = false;
  video.src = SAMPLE_VIDEO; video.loop = true;
  video.onloadeddata = () => { video.play(); startSession(); };
};
$("b-upload").onclick = () => $("file").click();
$("file").onchange = () => {
  const f = $("file").files[0]; if (!f || !pose) return;
  stopStream(); camMode = false;
  video.src = URL.createObjectURL(f); video.loop = false;
  video.onloadeddata = () => { video.play(); startSession(); };
  video.onended = () => endSession($, getS(), stopStream);
};
$("b-cam").onclick = async () => {
  if (!pose) return;
  stopStream();
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
  } catch (e) { statusEl.textContent = "Camera blocked - allow camera access and try again."; return; }
  camMode = true; video.srcObject = camStream; video.loop = false;
  video.onloadeddata = () => { video.play(); startSession(); };
};
$("b-stop").onclick = () => endSession($, getS(), stopStream);
$("b-close").onclick = () => $("report").classList.remove("open");
$("b-again").onclick = () => { $("report").classList.remove("open"); };

window.__dbg = () => S ? {frames:S.frames, detected:S.detected, energyN:S.energyN, energySum:+S.energySum.toFixed(4), hasPrev:!!S.prev, accN:S.accN, t0:S.t0, tEnd:S.tEnd, reps:{knee:S.reps.knee.n, elbow:S.reps.elbow.n}, rom:{knee:+(S.angHi.knee-S.angLo.knee).toFixed(1), elbow:+(S.angHi.elbow-S.angLo.elbow).toFixed(1)}} : null;
loadEngine();
// headless/self-test hook
if (new URLSearchParams(location.search).has("autotest")) {
  const t0 = Date.now();
  let clicked = false;
  const iv = setInterval(() => {
    if (pose && !clicked) { clicked = true; $("b-sample").click(); }
    if ((S && S.frames > 120) || Date.now() - t0 > 180000) {
      clearInterval(iv);
      document.title = "AUTOTEST frames=" + (S ? S.frames : 0) + " detected=" + (S ? S.detected : 0);
    }
  }, 500);
}
