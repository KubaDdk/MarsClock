import type { PlanetInfo } from '../lib/planets'
import { formatMTC, pad2, type MarsClock } from '../lib/marsTime'
import { MOONS } from '../lib/moons'
import { PLANETS } from '../lib/planets'
import { heliocentricMissionState, type MissionInfo } from '../lib/missions'
import { computeSnapshot } from '../lib/ephemeris'

export type InfoSelection =
  | { type: 'planet'; planet: PlanetInfo }
  | { type: 'mission'; mission: MissionInfo }

interface InfoPanelProps {
  selection: InfoSelection
  marsClock: MarsClock | null
  simDate: Date
  isSnapshot?: boolean
  onClose: () => void
}

function PlanetPanel({
  planet,
  marsClock,
  simDate,
  isSnapshot,
}: {
  planet: PlanetInfo
  marsClock: MarsClock | null
  simDate: Date
  isSnapshot?: boolean
}) {
  const isMars = planet.id === 'mars'
  const moons = MOONS[planet.id] ?? []
  const snapshot = isSnapshot ? computeSnapshot(simDate) : null
  const position = snapshot?.planets[planet.id]

  return (
    <>
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

      {position && (
        <div className="mars-clock-block">
          <div className="mars-clock-label">POSITION ON SNAPSHOT DATE</div>
          <div className="mars-clock-date">
            {Math.round(position.degreeInSign)}&deg; {position.sign}
          </div>
          {planet.id === 'earth' && snapshot && (
            <div className="mars-clock-sub">
              Moon: {snapshot.moon.phaseName} &middot; {Math.round(snapshot.moon.illumination * 100)}% lit
            </div>
          )}
        </div>
      )}

      <p className="fact">{planet.fact}</p>

      <dl className="stat-grid">
        <div>
          <dt>Distance from Sun</dt>
          <dd>{planet.auFromSun} AU</dd>
        </div>
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

      {moons.length > 0 && (
        <div className="moons-list">
          <div className="moons-list-label">Tracked moons</div>
          <ul>
            {moons.map((m) => (
              <li key={m.name}>
                <span>{m.name}</span>
                <span className="muted">{m.periodDays < 1 ? `${(m.periodDays * 24).toFixed(1)} h` : `${m.periodDays.toFixed(1)} d`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function MissionPanel({ mission, simDate }: { mission: MissionInfo; simDate: Date }) {
  const host = mission.hostPlanetId ? PLANETS.find((p) => p.id === mission.hostPlanetId) : null

  return (
    <>
      <p className="fact">{mission.description}</p>
      <dl className="stat-grid">
        <div>
          <dt>Agency</dt>
          <dd>{mission.agency}</dd>
        </div>
        <div>
          <dt>Launched</dt>
          <dd>{mission.launched}</dd>
        </div>
        {mission.kind === 'orbiting' && host && (
          <div>
            <dt>Status</dt>
            <dd>Orbiting {host.name}</dd>
          </div>
        )}
        {mission.kind === 'heliocentric' &&
          (() => {
            const { au } = heliocentricMissionState(mission, simDate)
            return (
              <div>
                <dt>Distance from Sun</dt>
                <dd>
                  ~{au.toFixed(au < 2 ? 2 : 1)} AU
                  {mission.auPerYear ? (
                    <span className="muted"> ({mission.auPerYear > 0 ? '+' : ''}{mission.auPerYear} AU/yr)</span>
                  ) : null}
                </dd>
              </div>
            )
          })()}
      </dl>
      <p className="mission-note">Position is an approximation for this display, not live telemetry.</p>
    </>
  )
}

export default function InfoPanel({ selection, marsClock, simDate, isSnapshot, onClose }: InfoPanelProps) {
  const name = selection.type === 'planet' ? selection.planet.name : selection.mission.name
  const color = selection.type === 'planet' ? selection.planet.color : selection.mission.color

  return (
    <aside className="info-panel" role="dialog" aria-label={`${name} information`}>
      <button className="close-btn" onClick={onClose} aria-label="Back to overview">
        &times;
      </button>

      <div className="info-header" style={{ borderColor: color }}>
        <span className="dot" style={{ background: color }} />
        <h2>{name}</h2>
      </div>

      {selection.type === 'planet' ? (
        <PlanetPanel planet={selection.planet} marsClock={marsClock} simDate={simDate} isSnapshot={isSnapshot} />
      ) : (
        <MissionPanel mission={selection.mission} simDate={simDate} />
      )}
    </aside>
  )
}
