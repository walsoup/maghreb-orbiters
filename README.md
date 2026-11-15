# Orbiter Vitals

Baseline-relative health monitoring for long-duration crews: catch change against each crew member's own baseline, decide what the crew can handle onboard, and know what to queue for ground review. A single static page, no build, no backend. Built by Maghreb Orbiters for the NASA Space Apps Challenge 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions".

Live demo: https://walsoup.github.io/maghreb-orbiters/

## The idea

Flight surgeons do not judge a crew member against population averages; they judge them against their own pre-flight baseline. Orbiter Vitals works the same way. The first three logged days set the baseline, and every indicator is then assessed two ways: against absolute reference bands and against deviation from that personal baseline. The worse of the two wins.

The demo tells one story with known ground truth, not random data. The bundled 14-day scenario follows a synthetic crew member: baseline days 1-3, resistance exercise skipped on days 8-9 (schedule overrun), progressive sleep restriction days 9-13, and a solar particle event on day 11. Watch the dashboard catch each event as a deviation from baseline - that is the product.

## What it does

**Health dashboard**
- 10 indicators: blood pressure, resting heart rate, glucose, temperature, sleep, mood, exercise minutes, daily radiation dose, mobility (from the Motion Lab).
- Dual assessment per indicator: absolute reference band plus percent deviation from the crew member's own baseline (header shows "baseline set" once 3 days are logged).
- Status per indicator and overall: OK / WATCH / ACT.
- Clickable body figure: tap a region to see what it tracks and why spaceflight affects it. Regions change color with status. Radiation maps to bone marrow, the most radiosensitive tissue.
- Next steps written like ops: re-measure windows, what the crew handles onboard, what gets queued for ground (PMC) review.
- Trend alerts when an indicator worsens across the last 4 logged days.
- Charts with the target range shaded.
- Coverage is stated honestly: cardiovascular, metabolic, sleep/mood, exercise/mobility and radiation. Not yet covered: SANS (vision), CO2 exposure, cognitive performance, immune function.

**Motion Lab (experimental): on-device movement analysis**
- MediaPipe Pose Landmarker tracks 33 body landmarks per frame and draws a live skeleton overlay. No video ever leaves the device.
- Analyzes the bundled NASA ISS footage, your webcam, or any uploaded video file.
- Metrics: movement energy (joint speed, normalized to torso length), joint range of motion, movement smoothness, rep counting (squat and arm cycles via knee/elbow angle state machines), left/right asymmetry, tracking quality.
- Protocol matters: stand ~2 m from the camera, full body in frame, 60 s of the same squat + arm-raise cycle every session. A session score only means something against your own baseline under the same setup.
- Quality gate: sessions under 50% tracking quality or 20 s duration are refused instead of scored.
- The mobility index is explicitly experimental (formula disclosed on-screen: 0.45 energy + 0.30 range + 0.25 smoothness, quality-scaled). It is a session metric for spotting change against your own baseline, not a clinical measure.
- One click logs the index into the health record as a tracked indicator.

**Live space weather (NASA DONKI)**
- Auto-checks for solar particle events in the last 7 days on load (cached 6 h, works offline with stale cache - the deep-space constraint).
- A recent SEP raises a banner with the radiation protocol: postpone EVAs, shelter in the most shielded module during elevated flux, confirm dosimeter readings, log dose twice daily.
- The banner cross-references today's logged dose and says whether it is elevated against the 1.0 mSv/day OK band, so an event and the crew's actual exposure are read together.

## Run it

No build, no install.

1. Download or clone the repo.
2. Open `index.html` in a browser.

Health data stays in your browser (localStorage) and pose estimation runs fully on-device; no video ever leaves the machine. The Motion Lab loads its pose engine from public CDNs, so it needs an internet connection, like the DONKI check. The sample NASA footage is bundled in the repo.

## Repo layout

- `index.html` - the whole app (HTML + CSS + JS, no dependencies to install)
- `astro-motion.mp4` - demo clip cut from NASA's "How Do Astronauts Exercise in Space?" (public domain)
- `LICENSE` - MIT

The MediaPipe pose engine (model + runtime) loads from CDN at runtime: https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision and https://storage.googleapis.com/mediapipe-models

## Challenge hazards covered

| Hazard | Indicators |
| --- | --- |
| Space radiation | daily dose, DONKI solar particle events, SEP banner with dose cross-check |
| Isolation and confinement | mood, sleep (with deviation-from-baseline alerts) |
| Gravity fields | mobility index (motion tracking), exercise, heart rate, blood pressure |
| Hostile closed environment | temperature |

Not covered (stated, not hidden): SANS/vision, CO2 and atmosphere, cognitive performance, immune function. Glucose is tracked as a metabolic indicator but we no longer claim it as closed-environment coverage.

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

Prototype built during the hackathon. Reference bands are general adult values for demo purposes - on a real mission, flight surgeons set per-crew thresholds, and the Motion Lab protocol would be calibrated per crew member against their own pre-flight baseline. Next ideas: validated mood instrument, camera-based pulse (rPPG), per-crew baseline import, offline sync to ground. Issues and suggestions welcome.

## AI use

Built with AI assistance (code generation, drafting and an adversarial second-opinion review that drove the overhaul: scripted ground-truth scenario, baseline-relative assessment, honest claims). The team reviewed and directed the work.

## License

MIT. See `LICENSE`. NASA footage is public domain. MediaPipe model and runtime are by Google (see their licenses).
