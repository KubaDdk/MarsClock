export interface MoonInfo {
  name: string
  periodDays: number
  radiusPx: number // visual size, screen pixels at the zoomed-in scale
  orbitRadiusPx: number // schematic orbit radius around the planet, screen pixels
  color: string
  retrograde?: boolean
}

// A curated subset of each planet's moons (real orbital periods), kept short
// so the zoomed-in view stays legible. Positions are driven by the same
// simulated clock as the planets, so they only visibly move once you speed
// up time.
export const MOONS: Record<string, MoonInfo[]> = {
  earth: [{ name: 'Moon', periodDays: 27.32, radiusPx: 3, orbitRadiusPx: 34, color: '#d8d8d8' }],
  mars: [
    { name: 'Phobos', periodDays: 0.319, radiusPx: 1.6, orbitRadiusPx: 22, color: '#9c8672' },
    { name: 'Deimos', periodDays: 1.263, radiusPx: 1.4, orbitRadiusPx: 30, color: '#a89684' },
  ],
  jupiter: [
    { name: 'Io', periodDays: 1.769, radiusPx: 3.2, orbitRadiusPx: 40, color: '#e8d27a' },
    { name: 'Europa', periodDays: 3.551, radiusPx: 2.8, orbitRadiusPx: 50, color: '#d8c9a8' },
    { name: 'Ganymede', periodDays: 7.155, radiusPx: 3.8, orbitRadiusPx: 62, color: '#a89880' },
    { name: 'Callisto', periodDays: 16.689, radiusPx: 3.6, orbitRadiusPx: 76, color: '#8a7a6a' },
  ],
  saturn: [
    { name: 'Enceladus', periodDays: 1.37, radiusPx: 2, orbitRadiusPx: 38, color: '#eef6ff' },
    { name: 'Tethys', periodDays: 1.888, radiusPx: 2.2, orbitRadiusPx: 46, color: '#dfe8ee' },
    { name: 'Dione', periodDays: 2.737, radiusPx: 2.4, orbitRadiusPx: 54, color: '#cfd8de' },
    { name: 'Rhea', periodDays: 4.518, radiusPx: 2.8, orbitRadiusPx: 64, color: '#c3ccd2' },
    { name: 'Titan', periodDays: 15.945, radiusPx: 4, orbitRadiusPx: 80, color: '#e0a95c' },
    { name: 'Iapetus', periodDays: 79.33, radiusPx: 2.6, orbitRadiusPx: 96, color: '#8a8078' },
  ],
  uranus: [
    { name: 'Miranda', periodDays: 1.413, radiusPx: 1.8, orbitRadiusPx: 36, color: '#b9c4c9' },
    { name: 'Ariel', periodDays: 2.52, radiusPx: 2.4, orbitRadiusPx: 46, color: '#c9d2d6' },
    { name: 'Umbriel', periodDays: 4.144, radiusPx: 2.4, orbitRadiusPx: 56, color: '#8f9598' },
    { name: 'Titania', periodDays: 8.706, radiusPx: 3, orbitRadiusPx: 68, color: '#aab0b4' },
    { name: 'Oberon', periodDays: 13.463, radiusPx: 2.9, orbitRadiusPx: 80, color: '#9aa0a4' },
  ],
  neptune: [
    { name: 'Triton', periodDays: 5.877, radiusPx: 3.4, orbitRadiusPx: 48, color: '#c9d8e0', retrograde: true },
    { name: 'Proteus', periodDays: 1.122, radiusPx: 2, orbitRadiusPx: 34, color: '#8a8f92' },
  ],
}
