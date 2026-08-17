// Martian timekeeping: Mars Sol Date (MSD), Mars Coordinated Time (MTC),
// and the Darian calendar.
//
// Epoch: MSD 0.0 = 1873-12-29 00:00:00 UTC = Julian Date 2405522.0
// Sol length: 88,775.244 SI seconds (24 MTC hours of ~1.02749 SI seconds each)

const MS_PER_DAY = 86_400_000
const UNIX_EPOCH_JD = 2440587.5 // Julian Date at 1970-01-01T00:00:00Z
const MSD_EPOCH_JD = 2405522.0 // Julian Date at MSD 0.0
const SOL_RATIO = 1.0274912517 // Earth days per sol (approx, standard Mars24 constant)

export const DARIAN_MONTHS = [
  { name: 'Sagittarius', quarter: 1, sols: 28 },
  { name: 'Dhanus', quarter: 1, sols: 28 },
  { name: 'Capricornus', quarter: 1, sols: 28 },
  { name: 'Makara', quarter: 1, sols: 28 },
  { name: 'Aquarius', quarter: 1, sols: 28 },
  { name: 'Kumbha', quarter: 1, sols: 27 },
  { name: 'Pisces', quarter: 2, sols: 28 },
  { name: 'Mina', quarter: 2, sols: 28 },
  { name: 'Aries', quarter: 2, sols: 28 },
  { name: 'Mesha', quarter: 2, sols: 28 },
  { name: 'Taurus', quarter: 2, sols: 28 },
  { name: 'Rishabha', quarter: 2, sols: 27 },
  { name: 'Gemini', quarter: 3, sols: 28 },
  { name: 'Mithuna', quarter: 3, sols: 28 },
  { name: 'Cancer', quarter: 3, sols: 28 },
  { name: 'Karka', quarter: 3, sols: 28 },
  { name: 'Leo', quarter: 3, sols: 28 },
  { name: 'Simha', quarter: 3, sols: 27 },
  { name: 'Virgo', quarter: 4, sols: 28 },
  { name: 'Kanya', quarter: 4, sols: 28 },
  { name: 'Libra', quarter: 4, sols: 28 },
  { name: 'Tula', quarter: 4, sols: 28 },
  { name: 'Scorpius', quarter: 4, sols: 28 },
  { name: 'Vrishchika', quarter: 4, sols: 27 }, // 28 in a leap mir
] as const

const QUARTER_NAMES = [
  'Northern Spring',
  'Northern Summer',
  'Northern Autumn',
  'Northern Winter',
]

/** Darian calendar leap rule (Gangale, basic decennial form):
 *  a mir is leap (669 sols) if it's odd, or divisible by 10 -
 *  except centennial mirs, which are leap only if also divisible by 500. */
export function isLeapMir(mir: number): boolean {
  if (mir % 500 === 0) return true
  if (mir % 100 === 0) return false
  if (mir % 10 === 0) return true
  return Math.abs(mir % 2) === 1
}

function mirLength(mir: number): number {
  return isLeapMir(mir) ? 669 : 668
}

export function julianDate(date: Date): number {
  return date.getTime() / MS_PER_DAY + UNIX_EPOCH_JD
}

/** Mars Sol Date: fractional sol count since the MSD epoch. */
export function marsSolDate(date: Date): number {
  return (julianDate(date) - MSD_EPOCH_JD) / SOL_RATIO
}

/** Mars Coordinated Time, as fractional hours [0, 24) at the Martian prime meridian. */
export function marsCoordinatedTimeHours(msd: number): number {
  const frac = msd - Math.floor(msd)
  return frac * 24
}

export interface DarianDate {
  mir: number
  monthIndex: number // 0-based, 0..23
  monthName: string
  quarter: number
  quarterName: string
  solInMonth: number // 1-based
  solInMir: number // 1-based, 1..668/669
  weekNumber: number // 1-based, week within the mir
  isLeapMir: boolean
}

export function solToDarianDate(solNum: number): DarianDate {
  let mir = 0
  let remaining = solNum

  if (remaining >= 0) {
    while (remaining >= mirLength(mir)) {
      remaining -= mirLength(mir)
      mir++
    }
  } else {
    while (remaining < 0) {
      mir--
      remaining += mirLength(mir)
    }
  }

  const leap = isLeapMir(mir)
  let solRem = remaining // 0-based sol within the mir
  let monthIndex = 0
  for (; monthIndex < DARIAN_MONTHS.length; monthIndex++) {
    const base = DARIAN_MONTHS[monthIndex]
    const sols = monthIndex === 23 && leap ? 28 : base.sols
    if (solRem < sols) break
    solRem -= sols
  }

  const month = DARIAN_MONTHS[monthIndex]

  return {
    mir,
    monthIndex,
    monthName: month.name,
    quarter: month.quarter,
    quarterName: QUARTER_NAMES[month.quarter - 1],
    solInMonth: solRem + 1,
    solInMir: remaining + 1,
    weekNumber: Math.floor(remaining / 7) + 1,
    isLeapMir: leap,
  }
}

export interface MarsClock {
  msd: number
  sol: number
  hours: number
  minutes: number
  seconds: number
  darian: DarianDate
}

export function computeMarsClock(date: Date): MarsClock {
  const msd = marsSolDate(date)
  const sol = Math.floor(msd)
  const mtc = marsCoordinatedTimeHours(msd)
  const hours = Math.floor(mtc)
  const minutesFloat = (mtc - hours) * 60
  const minutes = Math.floor(minutesFloat)
  const seconds = Math.floor((minutesFloat - minutes) * 60)

  return {
    msd,
    sol,
    hours,
    minutes,
    seconds,
    darian: solToDarianDate(sol),
  }
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

export function formatMTC(clock: MarsClock): string {
  return `${pad2(clock.hours)}:${pad2(clock.minutes)}:${pad2(clock.seconds)} MTC`
}

export function formatDarian(clock: MarsClock): string {
  const d = clock.darian
  return `${d.monthName} ${d.solInMonth}, Mir ${d.mir}`
}
