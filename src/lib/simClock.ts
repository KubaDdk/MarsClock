import { useEffect, useRef, useState } from 'react'

export interface SpeedPreset {
  label: string
  secondsPerSecond: number // simulated seconds that pass per one real second
}

export const SPEED_PRESETS: SpeedPreset[] = [
  { label: 'Real-time', secondsPerSecond: 1 },
  { label: '1 hr/s', secondsPerSecond: 3600 },
  { label: '1 day/s', secondsPerSecond: 86400 },
  { label: '1 wk/s', secondsPerSecond: 604800 },
  { label: '1 mo/s', secondsPerSecond: 2629800 },
  { label: '1 yr/s', secondsPerSecond: 31557600 },
]

export interface SimClockState {
  simMs: number
  speed: number
}

/** Shared simulated-time state. The ref is the authoritative clock, advanced
 * every animation frame by the canvas loop; this hook just polls it on an
 * interval so React-rendered UI (the header clock, speed buttons) can
 * reflect it without re-rendering 60 times a second. */
export function useSimClock() {
  const stateRef = useRef<SimClockState>({ simMs: Date.now(), speed: SPEED_PRESETS[0].secondsPerSecond })
  const [speed, setSpeedState] = useState(stateRef.current.speed)
  const [displayDate, setDisplayDate] = useState(new Date(stateRef.current.simMs))

  useEffect(() => {
    const id = setInterval(() => {
      setDisplayDate(new Date(stateRef.current.simMs))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  function setSpeed(secondsPerSecond: number) {
    stateRef.current.speed = secondsPerSecond
    setSpeedState(secondsPerSecond)
  }

  function resetToNow() {
    stateRef.current.simMs = Date.now()
    setDisplayDate(new Date(stateRef.current.simMs))
  }

  /** Jumps to a specific date and freezes the clock there (speed 0) — used for
   * point-in-time snapshots rather than continuous fast-forward playback. */
  function jumpToDate(date: Date) {
    stateRef.current.simMs = date.getTime()
    stateRef.current.speed = 0
    setSpeedState(0)
    setDisplayDate(date)
  }

  return { stateRef, speed, setSpeed, displayDate, resetToNow, jumpToDate }
}
