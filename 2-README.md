# Orbiter Vitals

A single-page health dashboard that lets astronauts on long missions check their own health and know when to act. Built by Maghreb Orbiters for the NASA Space Apps Challenge 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions".

## What it does

- Log 9 indicators: blood pressure, resting heart rate, glucose, temperature, sleep, mood, exercise, daily radiation dose.
- Color coding (green / yellow / red) per indicator and overall.
- Clickable body figure: tap a region to see what it tracks and why spaceflight affects it. Regions change color with status.
- Plain-language next steps for anything out of range.
- Trend alerts when an indicator worsens 4 days in a row.
- Charts with the target range shaded.
- Live NASA DONKI check for recent solar particle events (radiation risk).
- Demo buttons: simulate a normal 14-day mission or a "bad week".

## Run it

No build, no install.

1. Download or clone the repo.
2. Open `index.html` in a browser.

Data stays in your browser (localStorage). The DONKI button needs an internet connection.

## Challenge hazards covered

| Hazard | Indicators |
| --- | --- |
| Space radiation | daily dose, DONKI solar events |
| Isolation and confinement | mood, sleep |
| Gravity fields | exercise (bone and muscle loss countermeasure), heart rate, blood pressure |
| Hostile closed environment | temperature, glucose |

## Sources

- NASA Human Research Program, 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- NASA HRP, Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- NASA HRP, Ongoing research: https://www.nasa.gov/hrp/ongoing-hrp-research/
- CSA, Monitoring Radiation for Astronaut Health: https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- NASA DONKI space weather API: https://ccmc.gsfc.nasa.gov/DONKI-API/
- Challenge brief: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

## Status and feedback

Prototype built during the hackathon. Reference ranges are general adult values for a quick self-check, not medical advice. Real thresholds would come from flight surgeons. Ideas: camera-based pulse, ultrasound image input, per-crew baselines, offline sync to ground. Issues and suggestions welcome.

## AI use

Built with AI assistance (code generation and drafting). The team reviewed and directed the work.

## License

MIT. See `LICENSE`.
