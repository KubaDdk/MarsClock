export type MissionKind = 'orbiting' | 'heliocentric'

export interface MissionInfo {
  id: string
  name: string
  shortLabel?: string // compact label for crowded canvas markers; falls back to name
  kind: MissionKind
  agency: string
  launched: string
  description: string
  color: string
  // 'orbiting': circles a host planet, like a moon.
  hostPlanetId?: string
  orbitRadiusPx?: number
  periodDays?: number
  // 'heliocentric': own position around the Sun, distance drifting over
  // real time from an anchoring epoch — approximate, not live telemetry.
  angleDeg?: number
  angleDegPerYear?: number
  distanceAuAtEpoch?: number
  auPerYear?: number
  epoch?: string
  // optional oscillation, for eccentric orbits like Parker Solar Probe's
  oscillationAmplitudeAu?: number
  oscillationPeriodDays?: number
}

/** Live-ish heliocentric distance/angle for a mission, extrapolated linearly
 * (plus optional oscillation) from its anchoring epoch. Approximate. */
export function heliocentricMissionState(m: MissionInfo, date: Date): { au: number; angleDeg: number } {
  const epochMs = m.epoch ? new Date(m.epoch).getTime() : Date.UTC(2000, 0, 1)
  const yearsSinceEpoch = (date.getTime() - epochMs) / (365.25 * 86400000)
  let au = (m.distanceAuAtEpoch ?? 1) + (m.auPerYear ?? 0) * yearsSinceEpoch
  if (m.oscillationAmplitudeAu && m.oscillationPeriodDays) {
    const daysSinceEpoch = (date.getTime() - epochMs) / 86400000
    au += m.oscillationAmplitudeAu * Math.sin((2 * Math.PI * daysSinceEpoch) / m.oscillationPeriodDays)
  }
  au = Math.max(0.02, au)
  const angleDeg = (m.angleDeg ?? 0) + (m.angleDegPerYear ?? 0) * yearsSinceEpoch
  return { au, angleDeg }
}

export const MISSIONS: MissionInfo[] = [
  {
    id: 'voyager1',
    name: 'Voyager 1',
    kind: 'heliocentric',
    agency: 'NASA',
    launched: '1977',
    description:
      "Humanity's most distant spacecraft, launched in 1977 and now traveling through interstellar space beyond the heliopause.",
    color: '#f2e6a8',
    angleDeg: 35,
    distanceAuAtEpoch: 163,
    auPerYear: 3.6,
    epoch: '2024-01-01',
  },
  {
    id: 'voyager2',
    name: 'Voyager 2',
    kind: 'heliocentric',
    agency: 'NASA',
    launched: '1977',
    description:
      'The only spacecraft to have visited all four giant planets. Also crossed into interstellar space, on the opposite side of the Sun from its twin.',
    color: '#c8e8f2',
    angleDeg: 210,
    distanceAuAtEpoch: 136,
    auPerYear: 3.3,
    epoch: '2024-01-01',
  },
  {
    id: 'new-horizons',
    name: 'New Horizons',
    kind: 'heliocentric',
    agency: 'NASA',
    launched: '2006',
    description:
      'Flew past Pluto in 2015 and the Kuiper Belt object Arrokoth in 2019, and continues outward through the Kuiper Belt.',
    color: '#e8c9a0',
    angleDeg: 300,
    distanceAuAtEpoch: 58,
    auPerYear: 3.2,
    epoch: '2024-01-01',
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope',
    shortLabel: 'JWST',
    kind: 'orbiting',
    agency: 'NASA / ESA / CSA',
    launched: '2021',
    description:
      'Infrared observatory orbiting the Sun-Earth L2 point, about 1.5 million km beyond Earth, always facing away from the Sun.',
    color: '#f0d060',
    hostPlanetId: 'earth',
    orbitRadiusPx: 20,
    periodDays: 365.25,
  },
  {
    id: 'parker',
    name: 'Parker Solar Probe',
    shortLabel: 'Parker',
    kind: 'heliocentric',
    agency: 'NASA',
    launched: '2018',
    description:
      "The closest human-made object to the Sun, repeatedly diving through the outer solar corona on a tight, fast, decaying orbit.",
    color: '#ff8a3d',
    angleDeg: 60,
    distanceAuAtEpoch: 0.4,
    auPerYear: 0,
    oscillationAmplitudeAu: 0.32,
    oscillationPeriodDays: 88,
    epoch: '2024-01-01',
  },
  {
    id: 'juno',
    name: 'Juno',
    kind: 'orbiting',
    agency: 'NASA',
    launched: '2011',
    description: "Studying Jupiter's composition, gravity, and magnetic field from a wide polar orbit.",
    color: '#ffe0a0',
    hostPlanetId: 'jupiter',
    orbitRadiusPx: 26,
    periodDays: 53,
  },
  {
    id: 'mro',
    name: 'Mars Reconnaissance Orbiter',
    shortLabel: 'MRO',
    kind: 'orbiting',
    agency: 'NASA',
    launched: '2005',
    description:
      'High-resolution imaging of the Martian surface, and a communications relay for rovers on the ground.',
    color: '#c9dcff',
    hostPlanetId: 'mars',
    orbitRadiusPx: 18,
    periodDays: 0.13,
  },
  {
    id: 'bepicolombo',
    name: 'BepiColombo',
    kind: 'orbiting',
    agency: 'ESA / JAXA',
    launched: '2018',
    description:
      "Europe and Japan's joint mission to study Mercury, arriving in orbit after a seven-year cruise using multiple gravity assists.",
    color: '#d9d0c0',
    hostPlanetId: 'mercury',
    orbitRadiusPx: 14,
    periodDays: 2.3,
  },
  {
    id: 'europa-clipper',
    name: 'Europa Clipper',
    kind: 'heliocentric',
    agency: 'NASA',
    launched: '2024',
    description:
      "En route to Jupiter to study whether its icy moon Europa's subsurface ocean could support life. Arrives in 2030.",
    color: '#9fd0e8',
    angleDeg: 140,
    distanceAuAtEpoch: 1,
    auPerYear: 0.7,
    epoch: '2024-10-14',
  },
  {
    id: 'lucy',
    name: 'Lucy',
    kind: 'heliocentric',
    agency: 'NASA',
    launched: '2021',
    description:
      "Touring Jupiter's Trojan asteroid swarms on a twelve-year, multi-flyby journey — the first mission to explore them.",
    color: '#e0a8d0',
    angleDeg: 95,
    distanceAuAtEpoch: 1.6,
    auPerYear: 0.35,
    epoch: '2024-01-01',
  },
]
