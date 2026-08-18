import { useState, type FormEvent } from 'react'
import { PLANETS } from '../lib/planets'
import type { SolarSystemSnapshot } from '../lib/ephemeris'

interface BirthdatePanelProps {
  snapshot: SolarSystemSnapshot | null
  onCompute: (date: Date) => void
  onClear: () => void
  onClose: () => void
}

const today = new Date().toISOString().slice(0, 10)

export default function BirthdatePanel({ snapshot, onCompute, onClear, onClose }: BirthdatePanelProps) {
  const [value, setValue] = useState(snapshot ? snapshot.date.toISOString().slice(0, 10) : '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!value) return
    // Noon UTC keeps the snapshot stable regardless of the viewer's timezone.
    onCompute(new Date(`${value}T12:00:00Z`))
  }

  return (
    <aside className="info-panel birthdate-panel" role="dialog" aria-label="Birthdate planetary snapshot">
      <button className="close-btn" onClick={onClose} aria-label="Close">
        &times;
      </button>

      <div className="info-header" style={{ borderColor: '#5eead4' }}>
        <span className="dot" style={{ background: '#5eead4' }} />
        <h2>Birth Sky</h2>
      </div>

      <p className="fact">
        Enter a date to see where the planets and the Moon really were, using low-precision
        orbital mechanics (accurate to roughly a degree).
      </p>

      <form className="birthdate-form" onSubmit={handleSubmit}>
        <label htmlFor="birthdate-input">Date</label>
        <input
          id="birthdate-input"
          type="date"
          value={value}
          max={today}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <div className="birthdate-actions">
          <button type="submit" className="btn-primary">
            Show snapshot
          </button>
          {snapshot && (
            <button type="button" className="btn-secondary" onClick={onClear}>
              Back to live
            </button>
          )}
        </div>
      </form>

      {snapshot && (
        <>
          <div className="snapshot-date">
            Snapshot for {snapshot.date.toISOString().slice(0, 10)}, 12:00 UTC
          </div>

          <dl className="snapshot-grid">
            {PLANETS.map((p) => {
              const pos = snapshot.planets[p.id]
              return (
                <div key={p.id}>
                  <dt>
                    <span className="dot" style={{ background: p.color }} />
                    {p.name}
                  </dt>
                  <dd>
                    {Math.round(pos.degreeInSign)}&deg; {pos.sign}
                  </dd>
                </div>
              )
            })}
            <div>
              <dt>
                <span className="dot" style={{ background: '#d8dee8' }} />
                Moon
              </dt>
              <dd>
                {snapshot.moon.phaseName} &middot; {Math.round(snapshot.moon.illumination * 100)}% lit
              </dd>
            </div>
          </dl>

          <p className="fact muted-fact">
            Mars&rsquo; moons Phobos and Deimos orbit in hours, not days, so a single daily
            snapshot can&rsquo;t meaningfully place them.
          </p>
        </>
      )}
    </aside>
  )
}
