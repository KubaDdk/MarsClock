import { useEffect, useRef, type RefObject } from 'react'
import { PLANETS, SUN, type PlanetInfo } from '../lib/planets'
import { heliocentricAngle, auToRadiusPx } from '../lib/orbitalElements'
import { MOONS } from '../lib/moons'
import { MISSIONS, heliocentricMissionState, type MissionInfo } from '../lib/missions'
import type { SimClockState } from '../lib/simClock'

interface SolarSystemProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  simClockRef: RefObject<SimClockState>
}

interface Camera {
  x: number
  y: number
  scale: number
}

const MAX_ORBIT = Math.max(...PLANETS.map((p) => p.orbitRadius), 515)
const REF_EPOCH_MS = Date.UTC(2000, 0, 1)

function worldToScreen(wx: number, wy: number, cam: Camera, cx: number, cy: number) {
  return { x: cx + (wx - cam.x) * cam.scale, y: cy + (wy - cam.y) * cam.scale }
}

function missionId(m: MissionInfo): string {
  return `mission:${m.id}`
}

function missionHeliocentricWorldPos(m: MissionInfo, simDate: Date) {
  const { au, angleDeg } = heliocentricMissionState(m, simDate)
  const angleRad = (angleDeg * Math.PI) / 180
  const r = auToRadiusPx(au)
  return { x: Math.cos(angleRad) * r, y: Math.sin(angleRad) * r, au }
}

export default function SolarSystem({ selectedId, onSelect, simClockRef }: SolarSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId

  const stateRef = useRef({
    cam: { x: 0, y: 0, scale: 0.6 } as Camera,
    targetCam: { x: 0, y: 0, scale: 0.6 } as Camera,
    lastFrameMs: null as number | null,
    size: { w: 0, h: 0, dpr: 1 },
    hits: [] as { id: string; x: number; y: number; r: number }[],
    hover: null as string | null,
    fitScale: 0.6,
    planetScreens: {} as Record<string, { x: number; y: number }>,
  })

  useEffect(() => {
    const canvas = canvasRef.current!
    const container = containerRef.current!
    const ctx = canvas.getContext('2d')!
    const s = stateRef.current

    function resize() {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      s.size = { w: rect.width, h: rect.height, dpr }
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const padding = 56
      const fit = (Math.min(rect.width, rect.height) / 2 - padding) / MAX_ORBIT
      s.fitScale = Math.max(0.08, fit)
      if (!selectedIdRef.current) {
        s.targetCam.scale = s.fitScale
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    function planetWorldPos(p: PlanetInfo, simDate: Date) {
      const angle = heliocentricAngle(p.id, p.orbitalPeriodDays, simDate)
      return { x: Math.cos(angle) * p.orbitRadius, y: Math.sin(angle) * p.orbitRadius }
    }

    function drawHudGrid(cx: number, cy: number, w: number, h: number) {
      ctx.save()
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.06)'
      ctx.lineWidth = 1
      const rings = 6
      const maxR = Math.hypot(w, h) / 2
      for (let i = 1; i <= rings; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (maxR / rings) * i, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.045)'
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(w, cy)
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, h)
      ctx.stroke()
      ctx.restore()
    }

    function drawFocusBrackets(x: number, y: number, half: number) {
      ctx.strokeStyle = 'rgba(255, 227, 176, 0.9)'
      ctx.lineWidth = 1.4
      const cornerLen = 6
      const corners: [number, number, number, number][] = [
        [-half, -half, 1, 1],
        [half, -half, 1, -1],
        [-half, half, -1, 1],
        [half, half, -1, -1],
      ]
      corners.forEach(([ox, oy, dy1, dx2]) => {
        ctx.beginPath()
        ctx.moveTo(x + ox, y + oy + dy1 * cornerLen)
        ctx.lineTo(x + ox, y + oy)
        ctx.lineTo(x + ox + dx2 * cornerLen, y + oy)
        ctx.stroke()
      })
    }

    function drawMissionMarker(screenX: number, screenY: number, m: MissionInfo, isSel: boolean, showLabel: boolean) {
      const r = isSel ? 3.6 : 3
      ctx.save()
      ctx.translate(screenX, screenY)
      ctx.rotate(Math.PI / 4)
      ctx.fillStyle = m.color
      ctx.fillRect(-r, -r, r * 2, r * 2)
      ctx.lineWidth = isSel ? 1.6 : 1
      ctx.strokeStyle = isSel ? '#ffe3b0' : 'rgba(255,255,255,0.6)'
      ctx.strokeRect(-r, -r, r * 2, r * 2)
      ctx.restore()
      if (showLabel || isSel) {
        ctx.font = '9px "Share Tech Mono", monospace'
        ctx.fillStyle = isSel ? '#ffe3b0' : 'rgba(224, 240, 255, 0.65)'
        ctx.textAlign = 'left'
        ctx.fillText((m.shortLabel ?? m.name).toUpperCase(), screenX + r + 6, screenY + 3)
      }
      if (isSel) drawFocusBrackets(screenX, screenY, r + 9)
    }

    function draw(now: number) {
      const { w, h, dpr } = s.size
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) / 1.3)
      bg.addColorStop(0, '#0a1220')
      bg.addColorStop(1, '#03050a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      drawHudGrid(cx, cy, w, h)

      // advance the simulated clock by real elapsed time * speed multiplier
      const lastMs = s.lastFrameMs ?? now
      const dtMs = now - lastMs
      s.lastFrameMs = now
      const clock = simClockRef.current
      if (clock) clock.simMs += dtMs * clock.speed
      const simDate = new Date(clock ? clock.simMs : Date.now())
      const daysSinceRef = (simDate.getTime() - REF_EPOCH_MS) / 86400000

      const cam = s.cam
      const k = 1 - Math.pow(0.0025, 1 / 60)
      cam.x += (s.targetCam.x - cam.x) * k
      cam.y += (s.targetCam.y - cam.y) * k
      cam.scale += (s.targetCam.scale - cam.scale) * k

      // resolve what's selected: a bare planet id, a mission id, or nothing
      const sel = selectedIdRef.current
      let selectedMission: MissionInfo | null = null
      if (sel && sel.startsWith('mission:')) {
        selectedMission = MISSIONS.find((m) => missionId(m) === sel) ?? null
      }
      let zoomedHostId: string | null = null
      if (sel) {
        if (selectedMission) {
          if (selectedMission.kind === 'orbiting') zoomedHostId = selectedMission.hostPlanetId ?? null
        } else if (PLANETS.some((p) => p.id === sel)) {
          zoomedHostId = sel
        }
      }

      if (selectedMission) {
        if (selectedMission.kind === 'heliocentric') {
          const pos = missionHeliocentricWorldPos(selectedMission, simDate)
          s.targetCam = { x: pos.x, y: pos.y, scale: 10 }
        } else if (selectedMission.hostPlanetId) {
          const host = PLANETS.find((p) => p.id === selectedMission!.hostPlanetId)
          if (host) {
            const pos = planetWorldPos(host, simDate)
            const zoom = Math.min(14, Math.max(7, 220 / host.radius))
            s.targetCam = { x: pos.x, y: pos.y, scale: zoom }
          }
        }
      } else if (sel && PLANETS.some((p) => p.id === sel)) {
        const planet = PLANETS.find((p) => p.id === sel)!
        const pos = planetWorldPos(planet, simDate)
        const zoom = Math.min(14, Math.max(7, 220 / planet.radius))
        s.targetCam = { x: pos.x, y: pos.y, scale: zoom }
      } else {
        s.targetCam = { x: 0, y: 0, scale: s.fitScale }
      }

      const sunScreen = worldToScreen(0, 0, cam, cx, cy)

      // orbit paths
      PLANETS.forEach((p) => {
        const r = p.orbitRadius * cam.scale
        const isSelPlanet = p.id === sel
        ctx.save()
        ctx.beginPath()
        ctx.setLineDash(isSelPlanet ? [] : [3, 7])
        ctx.strokeStyle = isSelPlanet ? 'rgba(224, 105, 63, 0.55)' : 'rgba(94, 234, 212, 0.28)'
        ctx.lineWidth = isSelPlanet ? 1.6 : 1
        ctx.arc(sunScreen.x, sunScreen.y, r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      })

      // sun
      const sunR = Math.max(6, SUN.radius * cam.scale)
      const glowR = sunR * 3.2
      const glow = ctx.createRadialGradient(sunScreen.x, sunScreen.y, sunR * 0.2, sunScreen.x, sunScreen.y, glowR)
      glow.addColorStop(0, 'rgba(255, 224, 130, 0.55)')
      glow.addColorStop(1, 'rgba(255, 224, 130, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(sunScreen.x, sunScreen.y, glowR, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.fillStyle = SUN.color
      ctx.arc(sunScreen.x, sunScreen.y, sunR, 0, Math.PI * 2)
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.stroke()
      if (cam.scale < 4) {
        ctx.font = '11px "Share Tech Mono", monospace'
        ctx.fillStyle = 'rgba(255, 224, 130, 0.75)'
        ctx.textAlign = 'center'
        ctx.fillText('SOL', sunScreen.x, sunScreen.y + sunR + 14)
      }

      // planets
      s.hits = []
      s.planetScreens = {}
      PLANETS.forEach((p) => {
        const world = planetWorldPos(p, simDate)
        const screen = worldToScreen(world.x, world.y, cam, cx, cy)
        s.planetScreens[p.id] = screen
        const pr = Math.max(2.4, p.radius * cam.scale * (cam.scale > 3 ? 0.55 : 1))
        const isSelPlanet = p.id === sel
        const isHover = s.hover === p.id

        const pg = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, pr * 3)
        pg.addColorStop(0, p.glow + '55')
        pg.addColorStop(1, p.glow + '00')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(screen.x, screen.y, pr * 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.arc(screen.x, screen.y, pr, 0, Math.PI * 2)
        ctx.fill()
        ctx.lineWidth = isHover || isSelPlanet ? 1.6 : 1
        ctx.strokeStyle = isSelPlanet ? '#ffe3b0' : 'rgba(255,255,255,0.55)'
        ctx.stroke()

        if (isSelPlanet) drawFocusBrackets(screen.x, screen.y, pr + 10)

        // skip the label on the zoomed-in planet itself — the info panel already names it,
        // and the space is needed for moon/mission labels crowding in close by
        if (cam.scale < 3.2 && !isSelPlanet) {
          ctx.font = '10px "Share Tech Mono", monospace'
          ctx.fillStyle = 'rgba(224, 240, 255, 0.7)'
          ctx.textAlign = 'left'
          ctx.fillText(p.name.toUpperCase(), screen.x + pr + 8, screen.y + 3)
        }

        s.hits.push({ id: p.id, x: screen.x, y: screen.y, r: Math.max(pr, 9) })
      })

      // heliocentric missions (always visible, small diamond markers)
      MISSIONS.forEach((m) => {
        if (m.kind !== 'heliocentric') return
        const pos = missionHeliocentricWorldPos(m, simDate)
        const screen = worldToScreen(pos.x, pos.y, cam, cx, cy)
        const isSel = selectedMission?.id === m.id
        drawMissionMarker(screen.x, screen.y, m, isSel, cam.scale < 3.2)
        s.hits.push({ id: missionId(m), x: screen.x, y: screen.y, r: 9 })
      })

      // moons + orbiting missions around the currently zoomed planet
      if (zoomedHostId) {
        const hostScreen = s.planetScreens[zoomedHostId]
        if (hostScreen) {
          const moons = MOONS[zoomedHostId] ?? []
          moons.forEach((moon, mi) => {
            const dir = moon.retrograde ? -1 : 1
            const angle = mi * 1.7 + dir * 2 * Math.PI * (daysSinceRef / moon.periodDays)
            const mx = hostScreen.x + Math.cos(angle) * moon.orbitRadiusPx
            const my = hostScreen.y + Math.sin(angle) * moon.orbitRadiusPx

            ctx.beginPath()
            ctx.strokeStyle = 'rgba(255,255,255,0.12)'
            ctx.lineWidth = 1
            ctx.setLineDash([2, 4])
            ctx.arc(hostScreen.x, hostScreen.y, moon.orbitRadiusPx, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])

            ctx.beginPath()
            ctx.fillStyle = moon.color
            ctx.arc(mx, my, moon.radiusPx, 0, Math.PI * 2)
            ctx.fill()

            ctx.font = '9px "Share Tech Mono", monospace'
            ctx.fillStyle = 'rgba(224, 240, 255, 0.65)'
            ctx.textAlign = 'left'
            ctx.fillText(moon.name, mx + moon.radiusPx + 4, my + 3)
          })

          MISSIONS.filter((m) => m.kind === 'orbiting' && m.hostPlanetId === zoomedHostId).forEach((m, mi) => {
            const orbitR = m.orbitRadiusPx ?? 20
            const period = m.periodDays ?? 30
            const angle = mi * 2.1 + (2 * Math.PI * daysSinceRef) / period
            const mx = hostScreen.x + Math.cos(angle) * orbitR
            const my = hostScreen.y + Math.sin(angle) * orbitR
            const isSel = selectedMission?.id === m.id
            drawMissionMarker(mx, my, m, isSel, true)
            s.hits.push({ id: missionId(m), x: mx, y: my, r: 9 })
          })
        }
      }

      requestAnimationFrame(draw)
    }

    const raf = requestAnimationFrame(draw)

    function pick(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      let found: string | null = null
      let bestD = Infinity
      for (const hpt of s.hits) {
        const d = Math.hypot(x - hpt.x, y - hpt.y)
        if (d <= hpt.r + 6 && d < bestD) {
          found = hpt.id
          bestD = d
        }
      }
      return found
    }

    function handleClick(e: MouseEvent) {
      onSelect(pick(e.clientX, e.clientY))
    }
    function handleMove(e: MouseEvent) {
      const found = pick(e.clientX, e.clientY)
      s.hover = found
      canvas.style.cursor = found ? 'pointer' : 'default'
    }

    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('mousemove', handleMove)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('mousemove', handleMove)
    }
  }, [onSelect, simClockRef])

  return (
    <div ref={containerRef} className="solar-system">
      <canvas ref={canvasRef} />
    </div>
  )
}
