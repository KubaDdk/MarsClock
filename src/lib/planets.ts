export interface PlanetInfo {
  id: string
  name: string
  color: string
  glow: string
  radius: number // schematic display radius (px at scale 1)
  orbitRadius: number // schematic orbit radius (px at scale 1), not to real scale
  auFromSun: number // real average distance from the Sun, in astronomical units
  orbitalPeriodDays: number // Earth days per orbit, used for animation
  rotationHours: number // length of one day/sol, in Earth hours
  rotationLabel: string // human label for the day length
  massKg: string
  massRelativeToEarth: string
  gravity: string
  moons: number
  fact: string
}

export const SUN = {
  name: 'Sun',
  radius: 34,
  color: '#ffd35c',
  glow: '#fff3c4',
}

export const PLANETS: PlanetInfo[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#b7b0a8',
    glow: '#e7e0d6',
    radius: 4,
    orbitRadius: 70,
    auFromSun: 0.39,
    orbitalPeriodDays: 88,
    rotationHours: 1407.6,
    rotationLabel: '58 days 15 hours',
    massKg: '3.30 × 10^23 kg',
    massRelativeToEarth: '0.055 x Earth',
    gravity: '3.7 m/s^2',
    moons: 0,
    fact: 'Closest planet to the Sun, with the most extreme temperature swings.',
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#e8c27a',
    glow: '#ffe6b0',
    radius: 6,
    orbitRadius: 100,
    auFromSun: 0.72,
    orbitalPeriodDays: 224.7,
    rotationHours: 5832.5,
    rotationLabel: '243 days (retrograde)',
    massKg: '4.87 × 10^24 kg',
    massRelativeToEarth: '0.815 x Earth',
    gravity: '8.87 m/s^2',
    moons: 0,
    fact: 'Hottest planet in the solar system thanks to a runaway greenhouse effect.',
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#5aa9e6',
    glow: '#bfe3ff',
    radius: 6.4,
    orbitRadius: 136,
    auFromSun: 1.0,
    orbitalPeriodDays: 365.25,
    rotationHours: 23.934,
    rotationLabel: '23 hours 56 minutes',
    massKg: '5.97 × 10^24 kg',
    massRelativeToEarth: '1 x Earth',
    gravity: '9.81 m/s^2',
    moons: 1,
    fact: 'Home. The only known world with liquid oceans on its surface.',
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#e0693f',
    glow: '#ffb187',
    radius: 5,
    orbitRadius: 176,
    auFromSun: 1.52,
    orbitalPeriodDays: 686.98,
    rotationHours: 24.6597,
    rotationLabel: '24 hours 39 minutes 35 seconds (1 sol)',
    massKg: '6.42 × 10^23 kg',
    massRelativeToEarth: '0.107 x Earth',
    gravity: '3.71 m/s^2',
    moons: 2,
    fact: 'The Red Planet. Home to Olympus Mons, the largest volcano in the solar system.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#d9a066',
    glow: '#ffd9a0',
    radius: 22,
    orbitRadius: 250,
    auFromSun: 5.2,
    orbitalPeriodDays: 4332.6,
    rotationHours: 9.925,
    rotationLabel: '9 hours 56 minutes',
    massKg: '1.90 × 10^27 kg',
    massRelativeToEarth: '317.8 x Earth',
    gravity: '24.79 m/s^2',
    moons: 95,
    fact: 'The largest planet — its Great Red Spot is a storm bigger than Earth.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#e8d19a',
    glow: '#fff0c9',
    radius: 19,
    orbitRadius: 320,
    auFromSun: 9.58,
    orbitalPeriodDays: 10759,
    rotationHours: 10.66,
    rotationLabel: '10 hours 39 minutes',
    massKg: '5.68 × 10^26 kg',
    massRelativeToEarth: '95.2 x Earth',
    gravity: '10.44 m/s^2',
    moons: 146,
    fact: 'Famous for its dazzling ring system made of ice and rock.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#9fe0e0',
    glow: '#d4fbfb',
    radius: 13,
    orbitRadius: 380,
    auFromSun: 19.2,
    orbitalPeriodDays: 30688.5,
    rotationHours: 17.24,
    rotationLabel: '17 hours 14 minutes (retrograde)',
    massKg: '8.68 × 10^25 kg',
    massRelativeToEarth: '14.5 x Earth',
    gravity: '8.69 m/s^2',
    moons: 28,
    fact: 'Rotates on its side, with an axial tilt of about 98 degrees.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#5b7fe0',
    glow: '#a9c0ff',
    radius: 12.6,
    orbitRadius: 430,
    auFromSun: 30.05,
    orbitalPeriodDays: 60195,
    rotationHours: 16.11,
    rotationLabel: '16 hours 6 minutes',
    massKg: '1.02 × 10^26 kg',
    massRelativeToEarth: '17.1 x Earth',
    gravity: '11.15 m/s^2',
    moons: 16,
    fact: 'The windiest planet, with storms clocked over 2,000 km/h.',
  },
]

export const MARS_YEAR_FACT = {
  sols: '668.6 sols',
  earthDays: '~687 Earth days',
  mirs: '1 Mir (~1.881 Earth years)',
}
