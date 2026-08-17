# Mars Clock

<!-- redeploy trigger: forcing a fresh GitHub Pages build/publish cycle -->

A retro/schematic solar system dashboard that shows the current Martian date and time, built with React, TypeScript, and Vite. Runs entirely client-side.

- **Mars Sol Date (MSD)** and **Mars Coordinated Time (MTC)** computed live from the browser clock, using the epoch MSD 0.0 = 1873-12-29 00:00:00 UTC.
- Martian calendar dates rendered with the **Darian calendar** (24 months, 6 per quarter, 28/27 sols per month, decennial leap-mir rule).
- A schematic, animated orrery: the Sun at the centre, all eight planets on real (J2000-elements-based) heliocentric positions and trajectories, moving in real time.
- **Speed controls** (real-time up to 1 year/second) fast-forward the whole simulation — planets, moons, missions, and the Mars calendar — to see where everything will be, with the simulated date always shown.
- Click any planet — Mars especially — to fly the camera in and see live Martian time plus mass, gravity, day (sol) length, and year length. Zooming into a planet also reveals its major moons.
- Ten real spacecraft are tracked schematically, from Voyager 1/2 and New Horizons out past the heliopause to Juno at Jupiter and the James Webb Space Telescope — click one to see its story and (approximate) current distance from the Sun.

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
