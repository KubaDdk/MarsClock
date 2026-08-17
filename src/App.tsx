import { useCallback, useState } from 'react'
import SolarSystem from './components/SolarSystem'
import InfoPanel, { type InfoSelection } from './components/InfoPanel'
import SpeedControls from './components/SpeedControls'
import { computeMarsClock, formatMTC, pad2 } from './lib/marsTime'
import { PLANETS } from './lib/planets'
import { MISSIONS } from './lib/missions'
import { useSimClock } from './lib/simClock'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { stateRef: simClockRef, speed, setSpeed, displayDate, resetToNow } = useSimClock()
  const marsClock = computeMarsClock(displayDate)

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  let selection: InfoSelection | null = null
  if (selectedId) {
    if (selectedId.startsWith('mission:')) {
      const mission = MISSIONS.find((m) => `mission:${m.id}` === selectedId)
      if (mission) selection = { type: 'mission', mission }
    } else {
      const planet = PLANETS.find((p) => p.id === selectedId)
      if (planet) selection = { type: 'planet', planet }
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="title-block">
          <span className="title-glyph">&#9737;</span>
          <h1>MARS CLOCK</h1>
        </div>
        <div className="hud-readout">
          <span className="hud-label">MTC</span>
          <span className="hud-value">{formatMTC(marsClock)}</span>
          <span className="hud-sep">/</span>
          <span className="hud-label">{marsClock.darian.monthName}</span>
          <span className="hud-value">
            {pad2(marsClock.darian.solInMonth)}, Mir {marsClock.darian.mir}
          </span>
        </div>
      </header>

      <SpeedControls speed={speed} onSetSpeed={setSpeed} onResetToNow={resetToNow} displayDate={displayDate} />

      <main className="stage">
        <SolarSystem selectedId={selectedId} onSelect={handleSelect} simClockRef={simClockRef} />
        {!selection && <p className="hint">Click a planet or a mission marker to zoom in &mdash; try Mars.</p>}
      </main>

      {selection && (
        <InfoPanel selection={selection} marsClock={marsClock} simDate={displayDate} onClose={() => setSelectedId(null)} />
      )}

      <footer className="app-footer">
        <span>MSD {marsClock.msd.toFixed(3)}</span>
        <span>Sol epoch: 1873-12-29 00:00 UTC</span>
      </footer>
    </div>
  )
}
