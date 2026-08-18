import { useEffect, useRef } from 'react'
import { PLANETS, SUN, type PlanetInfo } from '../lib/planets'
import type { SolarSystemSnapshot } from '../lib/ephemeris'

interface SolarSystemProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** When set, planets are frozen at their real ecliptic positions for this snapshot instead of animating. */
  snapshot?: SolarSystemSnapshot | null
}

interface Camera {
  x: number
  y: number
  scale: number
}

// Simulated Earth-days advanced per real second of animation.
const TIME_SCALE = 4.2
// Fixed, aesthetically spread starting phase per planet (golden-angle-ish spacing).
const PHASE = PLANETS.map((_, i) => i * 2.399963)
const MAX_ORBIT = PLANETS[PLANETS.length - 1].orbitRadius

function angularSpeed(periodDays: number): number {
  return (2 * Math.PI * TIME_SCALE) / periodDays
}
const SPEEDS = PLANETS.map((p) => angularSpeed(p.orbitalPeriodDays))

function worldToScreen(
  wx: number,
  wy: number,
  cam: Camera,
  cx: number,
  cy: number,
) {
  return { x: cx + (wx - cam.x) * cam.scale, y: cy + (wy - cam.y) * cam.scale }
}

export default function SolarSystem({ selectedId, onSelect, snapshot }: SolarSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId
  const snapshotRef = useRef(snapshot)
  snapshotRef.current = snapshot

  const stateRef = useRef({
    cam: { x: 0, y: 0, scale: 0.6 } as Camera,
    targetCam: { x: 0, y: 0, scale: 0.6 } as Camera,
    startTime: performance.now(),
    size: { w: 0, h: 0, dpr: 1 },
    hits: [] as { id: string; x: number; y: number; r: number }[],
    hover: null as string | null,
    fitScale: 0.6,
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
      s.fitScale = Math.max(0.12, fit)
      if (!selectedIdRef.current) {
        s.targetCam.scale = s.fitScale
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    function planetWorldPos(p: PlanetInfo, idx: number, t: number) {
      const snap = snapshotRef.current
      const angle = snap
        ? (snap.planets[p.id].longitudeDeg * Math.PI) / 180
        : PHASE[idx] + t * SPEEDS[idx]
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

    function draw(now: number) {
      const { w, h, dpr } = s.size
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) / 1.3)
      bg.addColorStop(0, '#0a1220')
      bg.addColorStop(1, '#03050a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      drawHudGrid(cx, cy, w, h)

      const t = (now - s.startTime) / 1000
      const cam = s.cam

      // camera easing toward target
      const k = 1 - Math.pow(0.0025, 1 / 60)
      cam.x += (s.targetCam.x - cam.x) * k
      cam.y += (s.targetCam.y - cam.y) * k
      cam.scale += (s.targetCam.scale - cam.scale) * k

      if (selectedIdRef.current) {
        const idx = PLANETS.findIndex((p) => p.id === selectedIdRef.current)
        if (idx >= 0) {
          const pos = planetWorldPos(PLANETS[idx], idx, t)
          const zoom = Math.min(14, Math.max(7, 220 / PLANETS[idx].radius))
          s.targetCam = { x: pos.x, y: pos.y, scale: zoom }
        }
      } else {
        s.targetCam = { x: 0, y: 0, scale: s.fitScale }
      }

      const sunScreen = worldToScreen(0, 0, cam, cx, cy)

      // orbit paths (trajectories)
      PLANETS.forEach((p) => {
        const r = p.orbitRadius * cam.scale
        const isSel = p.id === selectedIdRef.current
        ctx.save()
        ctx.beginPath()
        ctx.setLineDash(isSel ? [] : [3, 7])
        ctx.strokeStyle = isSel ? 'rgba(224, 105, 63, 0.55)' : 'rgba(94, 234, 212, 0.28)'
        ctx.lineWidth = isSel ? 1.6 : 1
        ctx.arc(sunScreen.x, sunScreen.y, r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      })

      // sun
      const sunR = Math.max(6, SUN.radius * cam.scale)
      const glowR = sunR * 3.2
      const glow = ctx.createRadialGradient(
        sunScreen.x, sunScreen.y, sunR * 0.2,
        sunScreen.x, sunScreen.y, glowR,
      )
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
      PLANETS.forEach((p, idx) => {
        const world = planetWorldPos(p, idx, t)
        const screen = worldToScreen(world.x, world.y, cam, cx, cy)
        const pr = Math.max(2.4, p.radius * cam.scale * (cam.scale > 3 ? 0.55 : 1))
        const isSel = p.id === selectedIdRef.current
        const isHover = s.hover === p.id

        // glow
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
        ctx.lineWidth = isHover || isSel ? 1.6 : 1
        ctx.strokeStyle = isSel ? '#ffe3b0' : 'rgba(255,255,255,0.55)'
        ctx.stroke()

        if (isSel) {
          const b = pr + 10
          ctx.strokeStyle = 'rgba(255, 227, 176, 0.9)'
          ctx.lineWidth = 1.4
          const cornerLen = 6
          const corners = [
            [-b, -b, 1, 1],
            [b, -b, 1, -1],
            [-b, b, -1, 1],
            [b, b, -1, -1],
          ] as const
          corners.forEach(([ox, oy, dy1, dx2]) => {
            ctx.beginPath()
            ctx.moveTo(screen.x + ox, screen.y + oy + dy1 * cornerLen)
            ctx.lineTo(screen.x + ox, screen.y + oy)
            ctx.lineTo(screen.x + ox + dx2 * cornerLen, screen.y + oy)
            ctx.stroke()
          })
        }

        // label (skip clutter when deeply zoomed on another planet)
        if (cam.scale < 3.2 || isSel) {
          ctx.font = isSel ? '13px "Share Tech Mono", monospace' : '10px "Share Tech Mono", monospace'
          ctx.fillStyle = isSel ? '#ffe3b0' : 'rgba(224, 240, 255, 0.7)'
          ctx.textAlign = 'left'
          ctx.fillText(p.name.toUpperCase(), screen.x + pr + 8, screen.y + 3)
        }

        s.hits.push({ id: p.id, x: screen.x, y: screen.y, r: Math.max(pr, 9) })
      })

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
      const found = pick(e.clientX, e.clientY)
      onSelect(found)
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
  }, [onSelect])

  return (
    <div ref={containerRef} className="solar-system">
      <canvas ref={canvasRef} />
    </div>
  )
}
