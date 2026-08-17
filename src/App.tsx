import { useCallback, useEffect, useState } from 'react'
import SolarSystem from './components/SolarSystem'
import InfoPanel from './components/InfoPanel'
import { computeMarsClock, formatMTC, pad2, type MarsClock } from './lib/marsTime'
import { PLANETS } from './lib/planets'

function useMarsClock(): MarsClock {
  const [clock, setClock] = useState(() => computeMarsClock(new Date()))
  useEffect(() => {
    const id = setInterval(() => setClock(computeMarsClock(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return clock
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const marsClock = useMarsClock()

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const selectedPlanet = PLANETS.find((p) => p.id === selectedId) ?? null

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

      <main className="stage">
        <SolarSystem selectedId={selectedId} onSelect={handleSelect} />
        {!selectedPlanet && (
          <p className="hint">Click a planet to zoom in &mdash; try Mars.</p>
        )}
      </main>

      {selectedPlanet && (
        <InfoPanel
          planet={selectedPlanet}
          marsClock={selectedPlanet.id === 'mars' ? marsClock : null}
          onClose={() => setSelectedId(null)}
        />
      )}

      <footer className="app-footer">
        <span>MSD {marsClock.msd.toFixed(3)}</span>
        <span>Sol epoch: 1873-12-29 00:00 UTC</span>
      </footer>
    </div>
  )
}
