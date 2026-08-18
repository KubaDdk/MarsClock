# Mars Clock

A retro/schematic solar system dashboard that shows the current Martian date and time, built with React, TypeScript, and Vite. Runs entirely client-side.

- **Mars Sol Date (MSD)** and **Mars Coordinated Time (MTC)** computed live from the browser clock, using the epoch MSD 0.0 = 1873-12-29 00:00:00 UTC.
- Martian calendar dates rendered with the **Darian calendar** (24 months, 6 per quarter, 28/27 sols per month, decennial leap-mir rule).
- A schematic, animated orrery: the Sun at the centre, all eight planets on visible orbital trajectories.
- Click any planet — Mars especially — to fly the camera in and see live Martian time plus mass, gravity, day (sol) length, and year length.
- **Birthdate Snapshot**: enter any date and the orrery freezes into the real planetary configuration for that day — real ecliptic longitudes computed from low-precision Keplerian orbital elements (Paul Schlyter's classic method, epoch J2000.0), accurate to roughly a degree. Also shows the Moon's phase and each body's zodiac position.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs to `dist/`.

## Deploying to GitHub Pages

This repo ships with `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages on every push to `main`.

To enable it:

1. Push this repo to GitHub (already done if you're reading this from GitHub).
2. In the repository settings, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab). The site will be published at `https://<your-username>.github.io/MarsClock/`.

The Vite `base` path in `vite.config.ts` is set to `/MarsClock/` to match this repository's name — update it if you rename the repo or deploy under a different path.
