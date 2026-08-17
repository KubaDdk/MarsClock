import type { PlanetInfo } from '../lib/planets'
import { formatMTC, pad2, type MarsClock } from '../lib/marsTime'

interface InfoPanelProps {
  planet: PlanetInfo
  marsClock: MarsClock | null
  onClose: () => void
}

export default function InfoPanel({ planet, marsClock, onClose }: InfoPanelProps) {
  const isMars = planet.id === 'mars'

  return (
    <aside className="info-panel" role="dialog" aria-label={`${planet.name} information`}>
      <button className="close-btn" onClick={onClose} aria-label="Back to overview">
        &times;
      </button>

      <div className="info-header" style={{ borderColor: planet.color }}>
        <span className="dot" style={{ background: planet.color }} />
        <h2>{planet.name}</h2>
      </div>

      {isMars && marsClock && (
        <div className="mars-clock-block">
          <div className="mars-clock-label">MARTIAN LOCAL TIME</div>
          <div className="mars-clock-time">{formatMTC(marsClock)}</div>
          <div className="mars-clock-date">
            {marsClock.darian.monthName} {pad2(marsClock.darian.solInMonth)}
            <span className="sep">&middot;</span>
            Mir {marsClock.darian.mir}
          </div>
          <div className="mars-clock-sub">
            {marsClock.darian.quarterName} &nbsp;|&nbsp; Week {marsClock.darian.weekNumber}
            &nbsp;|&nbsp; Sol {marsClock.sol.toLocaleString()}
          </div>
          <div className="mars-clock-msd">MSD {marsClock.msd.toFixed(5)}</div>
        </div>
      )}

      <p className="fact">{planet.fact}</p>

      <dl className="stat-grid">
        <div>
          <dt>Mass</dt>
          <dd>
            {planet.massKg}
            <span className="muted"> ({planet.massRelativeToEarth})</span>
          </dd>
        </div>
        <div>
          <dt>Surface gravity</dt>
          <dd>{planet.gravity}</dd>
        </div>
        <div>
          <dt>{isMars ? 'Sol length' : 'Day length'}</dt>
          <dd>{planet.rotationLabel}</dd>
        </div>
        <div>
          <dt>Year length</dt>
          <dd>
            {planet.orbitalPeriodDays.toLocaleString()} Earth days
            {isMars && <span className="muted"> (668.6 sols)</span>}
          </dd>
        </div>
        <div>
          <dt>Moons</dt>
          <dd>{planet.moons}</dd>
        </div>
      </dl>
    </aside>
  )
}
