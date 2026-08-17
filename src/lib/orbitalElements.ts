import { julianDate } from './marsTime'

// Approximate J2000.0 orbital elements (Standish, low-precision form), used
// together with each planet's real orbital period to compute a schematic
// but astronomically grounded heliocentric position. Good enough for an
// orrery display, not for precision ephemeris work.

export interface OrbitalElements {
  meanLongitudeDeg: number // L at J2000
  longitudeOfPerihelionDeg: number // ϖ at J2000
  eccentricity: number
}

const J2000_JD = 2451545.0

export const PLANET_ELEMENTS: Record<string, OrbitalElements> = {
  mercury: { meanLongitudeDeg: 252.2509, longitudeOfPerihelionDeg: 77.4577, eccentricity: 0.2056 },
  venus: { meanLongitudeDeg: 181.9798, longitudeOfPerihelionDeg: 131.6025, eccentricity: 0.0068 },
  earth: { meanLongitudeDeg: 100.4664, longitudeOfPerihelionDeg: 102.9373, eccentricity: 0.0167 },
  mars: { meanLongitudeDeg: 355.4333, longitudeOfPerihelionDeg: 336.0602, eccentricity: 0.0934 },
  jupiter: { meanLongitudeDeg: 34.3515, longitudeOfPerihelionDeg: 14.3313, eccentricity: 0.0484 },
  saturn: { meanLongitudeDeg: 50.0775, longitudeOfPerihelionDeg: 92.5989, eccentricity: 0.0539 },
  uranus: { meanLongitudeDeg: 314.055, longitudeOfPerihelionDeg: 170.9642, eccentricity: 0.0473 },
  neptune: { meanLongitudeDeg: 304.3487, longitudeOfPerihelionDeg: 44.964, eccentricity: 0.0086 },
}

function degToRad(d: number): number {
  return (d * Math.PI) / 180
}

function normalizeDeg(d: number): number {
  return ((d % 360) + 360) % 360
}

/** Heliocentric ecliptic longitude (radians) at the given date. */
export function heliocentricAngle(planetId: string, orbitalPeriodDays: number, date: Date): number {
  const el = PLANET_ELEMENTS[planetId]
  if (!el) return 0

  const daysSinceJ2000 = julianDate(date) - J2000_JD
  const rateDegPerDay = 360 / orbitalPeriodDays
  const L = normalizeDeg(el.meanLongitudeDeg + rateDegPerDay * daysSinceJ2000)
  const M = degToRad(normalizeDeg(L - el.longitudeOfPerihelionDeg))
  const e = el.eccentricity

  // First-order equation of center (accurate to a fraction of a degree for e < 0.21).
  const C =
    (2 * e - (e ** 3) / 4) * Math.sin(M) +
    1.25 * e * e * Math.sin(2 * M) +
    (13 / 12) * e ** 3 * Math.sin(3 * M)

  return degToRad(L) + C
}

// Schematic (non-linear) AU-to-pixel mapping, anchored to the hand-tuned
// orbitRadius values already used for the eight planets so mission markers
// sit consistently on the same scale, then compressed logarithmically
// beyond Neptune so distant spacecraft stay on-canvas.
const AU_ANCHORS: [au: number, px: number][] = [
  [0, 0],
  [0.39, 70],
  [0.72, 100],
  [1.0, 136],
  [1.52, 176],
  [5.2, 250],
  [9.58, 320],
  [19.2, 380],
  [30.05, 430],
]

export function auToRadiusPx(au: number): number {
  if (au <= AU_ANCHORS[AU_ANCHORS.length - 1][0]) {
    for (let i = 1; i < AU_ANCHORS.length; i++) {
      const [au0, px0] = AU_ANCHORS[i - 1]
      const [au1, px1] = AU_ANCHORS[i]
      if (au <= au1) {
        const f = (au - au0) / (au1 - au0)
        return px0 + f * (px1 - px0)
      }
    }
  }
  return 430 + 70 * Math.log10(1 + (au - 30.05) / 10)
}
