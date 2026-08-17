import { SPEED_PRESETS } from '../lib/simClock'

interface SpeedControlsProps {
  speed: number
  onSetSpeed: (speed: number) => void
  onResetToNow: () => void
  displayDate: Date
}

function formatDisplayDate(d: Date): string {
  return (
    d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
  )
}

export default function SpeedControls({ speed, onSetSpeed, onResetToNow, displayDate }: SpeedControlsProps) {
  return (
    <div className="speed-controls">
      <div className="speed-buttons">
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset.label}
            className={speed === preset.secondsPerSecond ? 'speed-btn active' : 'speed-btn'}
            onClick={() => onSetSpeed(preset.secondsPerSecond)}
          >
            {preset.label}
          </button>
        ))}
        <button className="speed-btn now-btn" onClick={onResetToNow} title="Jump back to the present">
          Now
        </button>
      </div>
      <div className="sim-date" title="Simulated Earth date/time driving the whole display">
        {formatDisplayDate(displayDate)}
      </div>
    </div>
  )
}
