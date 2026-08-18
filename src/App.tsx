import { useCallback, useEffect, useMemo, useState } from 'react'
import SolarSystem from './components/SolarSystem'
import InfoPanel from './components/InfoPanel'
import BirthdatePanel from './components/BirthdatePanel'
import { computeMarsClock, formatMTC, pad2, type MarsClock } from './lib/marsTime'
import { PLANETS } from './lib/planets'
import { computeSnapshot } from './lib/ephemeris'

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
  const [birthdate, setBirthdate] = useState<Date | null>(null)
  const [showBirthdatePanel, setShowBirthdatePanel] = useState(false)
  const marsClock = useMarsClock()

  const snapshot = useMemo(() => (birthdate ? computeSnapshot(birthdate) : null), [birthdate])

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
        <button
          className="btn-secondary birthdate-toggle"
          onClick={() => setShowBirthdatePanel((v) => !v)}
        >
          {snapshot ? 'Birth Sky' : 'Birthdate Snapshot'}
        </button>
      </header>

      <main className="stage">
        <SolarSystem selectedId={selectedId} onSelect={handleSelect} snapshot={snapshot} />
        {!selectedPlanet && !snapshot && (
          <p className="hint">Click a planet to zoom in &mdash; try Mars.</p>
        )}
        {snapshot && <p className="hint snapshot-hint">Showing sky for {snapshot.date.toISOString().slice(0, 10)}</p>}
      </main>

      {selectedPlanet && (
        <InfoPanel
          planet={selectedPlanet}
          marsClock={selectedPlanet.id === 'mars' ? marsClock : null}
          snapshotPosition={snapshot ? snapshot.planets[selectedPlanet.id] : null}
          moonSnapshot={selectedPlanet.id === 'earth' ? snapshot?.moon ?? null : null}
          onClose={() => setSelectedId(null)}
        />
      )}

      {showBirthdatePanel && (
        <BirthdatePanel
          snapshot={snapshot}
          onCompute={(date) => setBirthdate(date)}
          onClear={() => setBirthdate(null)}
          onClose={() => setShowBirthdatePanel(false)}
        />
      )}

      <footer className="app-footer">
        <span>MSD {marsClock.msd.toFixed(3)}</span>
        <span>Sol epoch: 1873-12-29 00:00 UTC</span>
      </footer>
    </div>
  )
}
