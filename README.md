# ORBITER - Movement Intelligence

**We catch movement decline before the crew feels it.** Orbiter turns any camera on a spacecraft into a biomechanics instrument: it watches crew exercise and daily movement through ordinary video and measures what force plates and treadmills can't see - rep compliance, range-of-motion drift, left/right asymmetry, tempo - fully on-device. Built by Maghreb Orbiters for the NASA Space Apps Challenge 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions".

Live demo: https://walsoup.github.io/maghreb-orbiters/

## Why

On a long mission, exercise is the main countermeasure against bone and muscle loss - but the ground can't see whether it actually happened, or whether form is quietly degrading over months. Shrinking range of motion and growing left/right asymmetry are early injury signals; today nobody measures them in flight. Video is the only biomechanics instrument that works up there: no force plates in microgravity, and the ISS is already full of cameras. Orbiter monitors - it does not prescribe.

## What it does

- **Live pose tracking on any video.** MediaPipe Pose Landmarker (33 landmarks) runs fully in the browser on the bundled NASA ISS footage, your webcam, or any uploaded clip. No video ever leaves the device.
- **Rep counting.** Knee and elbow angle state machines count squat and arm cycles as they happen, with rep tempo.
- **Range of motion.** Per-joint ROM (knees, elbows, left/right) accumulated over the session - the metric that shrinks as deconditioning sets in.
- **Left/right symmetry.** Mean left-right joint-angle difference, live. Growing asymmetry is the classic early guarding signal.
- **Movement energy and smoothness.** Joint speed normalized to torso length, plus acceleration-based smoothness.
- **Streaming kinematics chart.** Knee and elbow angles, left and right, over a rolling 30-second window, with a tick every detected rep.
- **Session report.** Reps, ROM, energy, smoothness, asymmetry, duration, tracking quality - with percent deltas against your previous session on the same device. The quality gate refuses to score sessions under 50% tracking quality or 20 seconds: a score from a bad session is worse than no score.

## Honesty box

This is experimental movement analysis, not a clinical instrument. Every number is derived live from joint geometry and is disclosed on-screen. Session metrics are for spotting change against your own previous sessions under the same setup - full body in frame, ~2 m from the camera, steady lighting - never against population norms. Thresholds for a real mission would come from flight surgeons and per-crew pre-flight baselines.

## Run it

No build, no install. Open `index.html` in a browser, or use the live demo. The pose engine (MediaPipe model + runtime) loads from public CDNs, so first load needs an internet connection; analysis itself is fully local.

## Repo layout

- `index.html` - the whole app (HTML + CSS + JS, no dependencies to install)
- `astro-motion.mp4` - demo clip cut from NASA's "How Do Astronauts Exercise in Space?" (public domain)
- `LICENSE` - MIT

CDN dependencies at runtime: https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision, https://storage.googleapis.com/mediapipe-models, Google Fonts (Space Grotesk, JetBrains Mono).

## Sources

- NASA Human Research Program, 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- NASA HRP, Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- NASA, "How Do Astronauts Exercise in Space?" (demo footage, public domain): https://images.nasa.gov/details/jsc2025m000002_How_Do_Astronauts_Exercise_in_Space_250106-MP4
- MediaPipe Pose Landmarker (Google, on-device ML): https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
- Challenge brief: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

## Status and feedback

Prototype built during the hackathon. Next steps: per-crew baseline storage, ARED-specific exercise recognition, session history charts across a mission timeline, multi-person tracking. Issues and suggestions welcome.

## AI use

Built with AI assistance (code generation, drafting, and an adversarial second-opinion review that drove two full redesigns: from a vitals form to a baseline-relative monitor to this video-first instrument). The team reviewed and directed the work.

## License

MIT. See `LICENSE`. NASA footage is public domain. MediaPipe model and runtime are by Google (see their licenses).
