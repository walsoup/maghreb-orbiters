# Orbiter Vitals

A single-page health dashboard that lets astronauts on long missions check their own health and know when to act, with AI motion tracking that turns any camera into a musculoskeletal sensor. Built by Maghreb Orbiters for the NASA Space Apps Challenge 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions".

## What it does

**Motion Lab (new): pose estimation on video, fully in the browser**
- Analyzes the bundled NASA ISS footage, your webcam, or any uploaded video file. No video ever leaves the device.
- MediaPipe Pose Landmarker tracks 33 body landmarks per frame and draws a live skeleton overlay.
- Live metrics: movement energy (joint speed, normalized to torso length), knee and elbow angles, body-axis tilt (uncontrolled drift in 0g), tracking quality.
- Session summary: a 0-100 mobility index built from movement energy, total joint range of motion and movement smoothness.
- One click logs the mobility index into the health record, where it becomes a tracked indicator with its own status, trends chart and alerts.
- On a mission this means: no wearables needed for movement health. Any fixed camera can flag deconditioning, injury or fatigue early.

**Health dashboard**
- Log 9 more indicators: blood pressure, resting heart rate, glucose, temperature, sleep, mood, exercise, daily radiation dose.
- Color coding (green / yellow / red) per indicator and overall.
- Clickable body figure: tap a region to see what it tracks and why spaceflight affects it. Regions change color with status.
- Plain-language next steps for anything out of range.
- Trend alerts when an indicator worsens 4 days in a row.
- Charts with the target range shaded.
- Live NASA DONKI check for recent solar particle events (radiation risk).
- Demo buttons: simulate a normal 14-day mission or a "bad week".

## Run it

Live demo: https://walsoup.github.io/maghreb-orbiters/

Or run locally: no build, no install.

1. Download or clone the repo.
2. Open `index.html` in a browser.

Health data stays in your browser (localStorage) and pose estimation runs fully on-device; no video ever leaves the machine. The Motion Lab loads its pose engine from public CDNs, so it needs an internet connection, like the DONKI button. The sample NASA footage is bundled in the repo.

## Repo layout

- `index.html` - the whole app (HTML + CSS + JS, no dependencies to install)
- `astro-motion.mp4` - demo clip cut from NASA's "How Do Astronauts Exercise in Space?" (public domain)
- `LICENSE` - MIT

The MediaPipe pose engine (model + runtime) loads from CDN at runtime: https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision and https://storage.googleapis.com/mediapipe-models

## Challenge hazards covered

| Hazard | Indicators |
| --- | --- |
| Space radiation | daily dose, DONKI solar events |
| Isolation and confinement | mood, sleep |
| Gravity fields | mobility index (motion tracking), exercise, heart rate, blood pressure |
| Hostile closed environment | temperature, glucose |

## Sources

- NASA Human Research Program, 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- NASA HRP, Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- NASA HRP, Ongoing research: https://www.nasa.gov/hrp/ongoing-hrp-research/
- CSA, Monitoring Radiation for Astronaut Health: https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- NASA DONKI space weather API: https://ccmc.gsfc.nasa.gov/DONKI-API/
- NASA, "How Do Astronauts Exercise in Space?" (demo footage, public domain): https://images.nasa.gov/details/jsc2025m000002_How_Do_Astronauts_Exercise_in_Space_250106-MP4
- MediaPipe Pose Landmarker (Google, on-device ML): https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
- Challenge brief: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

## Status and feedback

Prototype built during the hackathon. Reference ranges are general adult values for a quick self-check, not medical advice. Real thresholds would come from flight surgeons, and the mobility index would be calibrated per crew member against their own baseline. Ideas: camera-based pulse (rPPG), ultrasound image input, per-crew baselines, rep counting for ARED exercises, offline sync to ground. Issues and suggestions welcome.

## AI use

Built with AI assistance (code generation and drafting, including the MediaPipe integration). The team reviewed and directed the work.

## License

MIT. See `LICENSE`. NASA footage is public domain. MediaPipe model and runtime are by Google (see their licenses).
