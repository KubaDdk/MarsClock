// Low-precision planetary ephemeris, after Paul Schlyter's classic
// "How to compute planetary positions" method (heliocentric Keplerian
// elements with linear day-rates, epoch J2000.0). Good to roughly a degree
// for the outer planets and a few arcminutes for the inner ones — plenty
// for a schematic, not-to-scale orrery snapshot.

const MS_PER_DAY = 86_400_000
const UNIX_EPOCH_JD = 2440587.5
const J2000_JD = 2451543.5 // 2000-01-00.0 UT, Schlyter's element epoch

function julianDate(date: Date): number {
  return date.getTime() / MS_PER_DAY + UNIX_EPOCH_JD
}

/** Days since the element epoch (2000 Jan 0.0 UT). May be negative for dates before 2000. */
function daysSinceEpoch(date: Date): number {
  return julianDate(date) - J2000_JD
}

const deg2rad = (d: number) => (d * Math.PI) / 180
const rad2deg = (r: number) => (r * 180) / Math.PI
const cosd = (d: number) => Math.cos(deg2rad(d))
const sind = (d: number) => Math.sin(deg2rad(d))
const norm360 = (d: number) => ((d % 360) + 360) % 360

interface Rate {
  base: number
  perDay: number
}

interface OrbitalElements {
  N: Rate // longitude of ascending node
  i: Rate // inclination
  w: Rate // argument of perihelion
  a: Rate // semi-major axis, AU
  e: Rate // eccentricity
  M: Rate // mean anomaly
}

const rate = (base: number, perDay: number): Rate => ({ base, perDay })

// Element sets, degrees / AU / days, from Schlyter's tutorial (stjarnhimlen.se).
// The "sun" entry gives the Sun's geocentric orbit, i.e. also Earth's heliocentric
// orbit shifted by 180 degrees of longitude.
const ELEMENTS: Record<string, OrbitalElements> = {
  mercury: {
    N: rate(48.3313, 3.24587e-5),
    i: rate(7.0047, 5.0e-8),
    w: rate(29.1241, 1.01444e-5),
    a: rate(0.387098, 0),
    e: rate(0.205635, 5.59e-10),
    M: rate(168.6562, 4.0923344368),
  },
  venus: {
    N: rate(76.6799, 2.4659e-5),
    i: rate(3.3946, 2.75e-8),
    w: rate(54.891, 1.38374e-5),
    a: rate(0.72333, 0),
    e: rate(0.006773, -1.302e-9),
    M: rate(48.0052, 1.6021302244),
  },
  sun: {
    // Sun as seen from Earth; Earth's heliocentric longitude = this + 180 deg.
    N: rate(0, 0),
    i: rate(0, 0),
    w: rate(282.9404, 4.70935e-5),
    a: rate(1.0, 0),
    e: rate(0.016709, -1.151e-9),
    M: rate(356.047, 0.9856002585),
  },
  mars: {
    N: rate(49.5574, 2.11081e-5),
    i: rate(1.8497, -1.78e-8),
    w: rate(286.5016, 2.92961e-5),
    a: rate(1.523688, 0),
    e: rate(0.093405, 2.516e-9),
    M: rate(18.6021, 0.5240207766),
  },
  jupiter: {
    N: rate(100.4542, 2.76854e-5),
    i: rate(1.303, -1.557e-7),
    w: rate(273.8777, 1.64505e-5),
    a: rate(5.20256, 0),
    e: rate(0.048498, 4.469e-9),
    M: rate(19.895, 0.083085300),
  },
  saturn: {
    N: rate(113.6634, 2.3898e-5),
    i: rate(2.4886, -1.081e-7),
    w: rate(339.3939, 2.97661e-5),
    a: rate(9.55475, 0),
    e: rate(0.055546, -9.499e-9),
    M: rate(316.967, 0.0334442282),
  },
  uranus: {
    N: rate(74.0005, 1.3978e-5),
    i: rate(0.7733, 1.9e-8),
    w: rate(96.6612, 3.0565e-5),
    a: rate(19.18171, -1.55e-8),
    e: rate(0.047318, 7.45e-9),
    M: rate(142.5905, 0.011725806),
  },
  neptune: {
    N: rate(131.7806, 3.0173e-5),
    i: rate(1.77, -2.55e-7),
    w: rate(272.8461, -6.027e-6),
    a: rate(30.05826, 3.313e-8),
    e: rate(0.008606, 2.15e-9),
    M: rate(260.2471, 0.005995147),
  },
  // Geocentric (Earth-centered) elements for the Moon.
  moon: {
    N: rate(125.1228, -0.0529538083),
    i: rate(5.1454, 0),
    w: rate(318.0634, 0.1643573223),
    a: rate(60.2666, 0),
    e: rate(0.0549, 0),
    M: rate(115.3654, 13.0649929509),
  },
}

function eccentricAnomaly(mDeg: number, e: number): number {
  let E = mDeg + rad2deg(e * Math.sin(deg2rad(mDeg)) * (1 + e * Math.cos(deg2rad(mDeg))))
  for (let iter = 0; iter < 12; iter++) {
    const delta = (E - rad2deg(e * Math.sin(deg2rad(E))) - mDeg) / (1 - e * cosd(E))
    E -= delta
    if (Math.abs(delta) < 1e-7) break
  }
  return E
}

interface EclipticPosition {
  /** Ecliptic longitude, degrees, normalized [0, 360). */
  longitude: number
  /** Distance from the reference body (Sun, or Earth for the Moon), AU (or Earth radii for the Moon). */
  radius: number
}

function solveOrbit(el: OrbitalElements, d: number): EclipticPosition {
  const N = norm360(el.N.base + el.N.perDay * d)
  const i = el.i.base + el.i.perDay * d
  const w = norm360(el.w.base + el.w.perDay * d)
  const a = el.a.base + el.a.perDay * d
  const e = el.e.base + el.e.perDay * d
  const M = norm360(el.M.base + el.M.perDay * d)

  const E = eccentricAnomaly(M, e)
  const xv = a * (cosd(E) - e)
  const yv = a * Math.sqrt(1 - e * e) * sind(E)
  const v = rad2deg(Math.atan2(yv, xv))
  const r = Math.hypot(xv, yv)

  const vw = v + w
  const xh = r * (cosd(N) * cosd(vw) - sind(N) * sind(vw) * cosd(i))
  const yh = r * (sind(N) * cosd(vw) + cosd(N) * sind(vw) * cosd(i))

  return { longitude: norm360(rad2deg(Math.atan2(yh, xh))), radius: r }
}

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

export function zodiacFor(longitudeDeg: number): { sign: string; degreeInSign: number } {
  const lon = norm360(longitudeDeg)
  const idx = Math.floor(lon / 30)
  return { sign: ZODIAC_SIGNS[idx], degreeInSign: lon - idx * 30 }
}

export interface PlanetSnapshot {
  id: string
  longitudeDeg: number
  sign: string
  degreeInSign: number
}

export interface MoonSnapshot {
  longitudeDeg: number
  sign: string
  degreeInSign: number
  /** 0 = new moon, 0.5 = full moon, 1 = new moon again. */
  phaseFraction: number
  phaseName: string
  /** Fraction of the visible disc illuminated, 0..1. */
  illumination: number
}

export interface SolarSystemSnapshot {
  date: Date
  planets: Record<string, PlanetSnapshot>
  moon: MoonSnapshot
}

const PLANET_IDS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

function moonPhaseName(phaseFraction: number): string {
  if (phaseFraction < 0.03 || phaseFraction > 0.97) return 'New Moon'
  if (phaseFraction < 0.22) return 'Waxing Crescent'
  if (phaseFraction < 0.28) return 'First Quarter'
  if (phaseFraction < 0.47) return 'Waxing Gibbous'
  if (phaseFraction < 0.53) return 'Full Moon'
  if (phaseFraction < 0.72) return 'Waning Gibbous'
  if (phaseFraction < 0.78) return 'Last Quarter'
  return 'Waning Crescent'
}

/** Computes real (low-precision) ecliptic positions of the Sun's planets and the Moon at a given moment. */
export function computeSnapshot(date: Date): SolarSystemSnapshot {
  const d = daysSinceEpoch(date)

  const sunGeoLon = solveOrbit(ELEMENTS.sun, d).longitude

  const planets: Record<string, PlanetSnapshot> = {}
  for (const id of PLANET_IDS) {
    const lon = id === 'earth' ? norm360(sunGeoLon + 180) : solveOrbit(ELEMENTS[id], d).longitude
    const { sign, degreeInSign } = zodiacFor(lon)
    planets[id] = { id, longitudeDeg: lon, sign, degreeInSign }
  }

  const moonPos = solveOrbit(ELEMENTS.moon, d)
  const phaseAngle = norm360(moonPos.longitude - sunGeoLon)
  const phaseFraction = phaseAngle / 360
  const illumination = (1 - Math.cos(deg2rad(phaseAngle))) / 2
  const moonZodiac = zodiacFor(moonPos.longitude)

  return {
    date,
    planets,
    moon: {
      longitudeDeg: moonPos.longitude,
      sign: moonZodiac.sign,
      degreeInSign: moonZodiac.degreeInSign,
      phaseFraction,
      phaseName: moonPhaseName(phaseFraction),
      illumination,
    },
  }
}
