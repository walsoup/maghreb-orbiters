import { STORAGE_KEY } from "./config.mjs";
import { sessionStats, evaluateSessionGate } from "./session.mjs";

export function endSession($, S, stopStream) {
  const m = sessionStats(S);
  stopStream();
  $("b-stop").style.display = "none";
  const body = $("rep-body"), note = $("rep-note");
  if (!m) { note.textContent = "Not enough tracking data - try a clip where the whole body is visible."; body.innerHTML = ""; $("report").classList.add("open"); return; }
  const { q, scorable } = evaluateSessionGate(m);
  if (!scorable) {
    note.textContent = `Session not scored: tracking quality ${q}%, duration ${Math.round(m.dur)}s. Need at least 50% quality and 15s - full body in frame, ~2 m, steady lighting.`;
    body.innerHTML = ""; $("report").classList.add("open"); return;
  }
  // compare to previous session (same device, same protocol = honest delta)
  const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date: new Date().toISOString(), energy: m.energy, smooth: m.smooth,
    asym: m.asym, rom: m.rom, reps: m.reps }));
  const d = (cur, old, unit, inv) => {
    if (old === undefined || old === null || !old) return "";
    const diff = cur - old, pct = Math.round(diff / (Math.abs(old) || 1) * 100);
    const col = (inv ? diff < 0 : diff > 0) ? "#4ef0c8" : "#ffb84d";
    return ` <span style="color:${col}; font-size:12px">${pct >= 0 ? "+" : ""}${pct}% vs last session</span>`;
  };
  note.textContent = `Quality ${q}% - duration ${Math.round(m.dur)}s. Derived live from joint geometry; compare only against your own sessions under the same setup.`;
  body.innerHTML = `
    <div class="row"><span>Squat reps (knee cycle)</span><b>${m.reps.knee}${d(m.reps.knee, prev?.reps?.knee)}</b></div>
    <div class="row"><span>Arm reps (elbow cycle)</span><b>${m.reps.elbow}${d(m.reps.elbow, prev?.reps?.elbow)}</b></div>
    <div class="row"><span>Range of motion - knees L/R</span><b>${m.rom.lKnee}° / ${m.rom.rKnee}°</b></div>
    <div class="row"><span>Range of motion - elbows L/R</span><b>${m.rom.lElbow}° / ${m.rom.rElbow}°</b></div>
    <div class="row"><span>Movement energy</span><b>${m.energy.toFixed(2)}${d(m.energy, prev?.energy)}</b></div>
    <div class="row"><span>Movement smoothness</span><b>${Math.round(m.smooth)}/100${d(Math.round(m.smooth), prev?.smooth && Math.round(prev.smooth))}</b></div>
    <div class="row"><span>Left/right asymmetry</span><b>${Math.round(m.asym)}° avg${d(Math.round(m.asym), prev?.asym && Math.round(prev.asym), "", true)}</b></div>`;
  $("report").classList.add("open");
}
