import { BONES, KEY_JOINTS, CH_WINDOW } from "./config.mjs";

export function drawSkeleton(og, overlay, trails, lm, W, H, ok) {
  const sx = overlay.width / W, sy = overlay.height / H;
  og.save();
  og.shadowColor = ok ? "#4ef0c8" : "#ffb84d"; og.shadowBlur = 12;
  og.lineWidth = 3; og.strokeStyle = ok ? "#4ef0c8" : "#ffb84d"; og.lineCap = "round";
  og.beginPath();
  for (const [a,b] of BONES) { og.moveTo(lm[a].x*W*sx, lm[a].y*H*sy); og.lineTo(lm[b].x*W*sx, lm[b].y*H*sy); }
  og.stroke();
  og.shadowBlur = 8; og.fillStyle = "#fff";
  for (const i of KEY_JOINTS) { og.beginPath(); og.arc(lm[i].x*W*sx, lm[i].y*H*sy, 3.5, 0, 7); og.fill(); }
  og.restore();
  // motion trails: wrists + ankles, fading
  const pts = { lw:lm[15], rw:lm[16], la:lm[27], ra:lm[28] };
  for (const k in pts) {
    const tr = trails[k]; tr.push({x:pts[k].x, y:pts[k].y}); if (tr.length > 12) tr.shift();
    og.beginPath();
    tr.forEach((p, i) => { const X=p.x*W*sx, Y=p.y*H*sy; i ? og.lineTo(X,Y) : og.moveTo(X,Y); });
    og.strokeStyle = "rgba(78,240,200,.22)"; og.lineWidth = 1.5; og.stroke();
  }
}

export function drawAngleArc(og, overlay, lm, a, b, c, W, H, label) {
  const sx = overlay.width / W, sy = overlay.height / H;
  const B = { x:lm[b].x*W*sx, y:lm[b].y*H*sy };
  const A = { x:lm[a].x*W*sx, y:lm[a].y*H*sy }, C = { x:lm[c].x*W*sx, y:lm[c].y*H*sy };
  const a1 = Math.atan2(A.y-B.y, A.x-B.x), a2 = Math.atan2(C.y-B.y, C.x-B.x);
  og.beginPath(); og.arc(B.x, B.y, 26, a1, a2);
  og.strokeStyle = "#ffffff88"; og.lineWidth = 2; og.stroke();
  og.fillStyle = "#fff"; og.font = "700 12px ui-monospace,monospace";
  og.fillText(label, B.x + 30, B.y - 6);
}

export function drawChart(cg, chart, S, t) {
  const W = chart.width = chart.clientWidth * devicePixelRatio;
  const H = chart.height = 160 * devicePixelRatio;
  const s = devicePixelRatio;
  cg.clearRect(0,0,W,H);
  cg.strokeStyle = "#1a2434"; cg.lineWidth = 1;
  for (let d = 60; d <= 180; d += 60) {
    const y = H - (d / 200) * H;
    cg.beginPath(); cg.moveTo(0,y); cg.lineTo(W,y); cg.stroke();
    cg.fillStyle = "#7e92b0"; cg.font = `${10*s}px ui-monospace,monospace`; cg.fillText(d + "°", 4, y - 3);
  }
  const series = [["lKnee","#4ef0c8"],["rKnee","#46a8ff"],["lElbow","#ffb84d"],["rElbow","#ff6b81"]];
  for (const [key, col] of series) {
    cg.beginPath(); cg.strokeStyle = col; cg.lineWidth = 1.6 * s;
    let started = false;
    for (const p of S.hist) {
      const x = ((p.t - (t - CH_WINDOW)) / CH_WINDOW) * W, y = H - (p[key] / 200) * H;
      started ? cg.lineTo(x,y) : cg.moveTo(x,y); started = true;
    }
    cg.stroke();
  }
  // rep markers
  for (const r of S.repTimes) {
    if (r.t < t - CH_WINDOW) continue;
    const x = ((r.t - (t - CH_WINDOW)) / CH_WINDOW) * W;
    cg.strokeStyle = "#ffffff44"; cg.lineWidth = 1;
    cg.beginPath(); cg.moveTo(x, 0); cg.lineTo(x, H); cg.stroke();
  }
}
