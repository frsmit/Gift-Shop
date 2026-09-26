import { useId, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Twinkles } from '../Twinkles'

// px. The SVG is three periods wide and slides left by exactly one period for a seamless
// loop, so even a 2880px-wide screen never sees its right edge.
const PERIOD = 1440
const WIDTH = PERIOD * 3

// An irregular, repeating wave edge built from a few sines whose frequencies all fit the period.
export function edgePoints(base: number, seed = 0) {
  const pts: [number, number][] = []
  for (let x = 0; x <= WIDTH; x += 16) {
    const t = (x / PERIOD) * Math.PI * 2
    const y = base + 11 * Math.sin(3 * t + seed) + 7 * Math.sin(5 * t + 1.3 + seed * 2) + 4 * Math.sin(8 * t + 0.4 + seed)
    pts.push([x, +y.toFixed(1)])
  }
  return pts
}

const line = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')

type LayerProps = {
  base: number
  seed: number
  height: number
  /** top → edge colours of the shallow water */
  water: [string, string]
  foam: string
  wet?: string
  className?: string
}

export function WaveLayer({ base, seed, height, water, foam, wet, className }: LayerProps) {
  const id = useId().replace(/:/g, '')
  const pts = edgePoints(base, seed)
  const edge = line(pts)
  // water extends well above the box so no gap opens when the wave pulls back
  const waterFill = `M0 -80 L${WIDTH} -80 L${pts.map(([x, y]) => `${x} ${y}`).reverse().join(' L')} Z`
  const wetBand = `${edge} L${pts.map(([x, y]) => `${x} ${y + 18}`).reverse().join(' L')} Z`
  return (
    <svg className={`absolute left-0 top-0 overflow-visible ${className ?? ''}`} width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={water[0]} />
          <stop offset="1" stopColor={water[1]} />
        </linearGradient>
      </defs>
      {wet && <path d={wetBand} fill={wet} />}
      <path d={waterFill} fill={`url(#water-${id})`} />
      <path d={edge} stroke={foam} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={line(edgePoints(base - 9, seed + 0.6))} stroke={foam} strokeOpacity="0.45" strokeWidth="2.5" fill="none" strokeDasharray="18 14" />
    </svg>
  )
}

// Where the sea meets the sand: curvy shallow water with foam that washes in and out.
export function Shoreline() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to('.shore-a', { y: 16, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.fromTo('.shore-b', { y: -6, opacity: 0.9 }, { y: 22, opacity: 0.35, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.8 })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="pointer-events-none absolute inset-x-0 -top-[34px] h-[110px] overflow-hidden">
      <div className="shore-b absolute inset-0">
        <WaveLayer base={52} seed={2.1} height={110} water={['rgba(160,230,232,0.35)', 'rgba(200,242,240,0.7)']} foam="#ffffff" className="animate-[shore-x_34s_linear_infinite_reverse]" />
      </div>
      <div className="shore-a absolute inset-0">
        <WaveLayer
          base={42}
          seed={0}
          height={110}
          water={['#6fd3dc', '#b5ecea']}
          foam="#ffffff"
          wet="rgba(190,160,110,0.45)"
          className="animate-[shore-x_48s_linear_infinite]"
        />
      </div>
    </div>
  )
}

/**
 * Night-time bioluminescence: glowing foam lines along the shore. Mounted alongside the
 * Shoreline (same box, same timing) and faded in at night, so it rides the same waves.
 */
export function ShoreGlow({ visible }: { visible: boolean }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to('.glow-a', { y: 16, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.fromTo('.glow-b', { y: -6 }, { y: 22, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.8 })
    },
    { scope: root },
  )

  const glowLine = (base: number, seed: number, width: number, opacity: number) => (
    <svg className="absolute left-0 top-0 overflow-visible" width={WIDTH} height={110} viewBox={`0 0 ${WIDTH} 110`} aria-hidden>
      <path d={line(edgePoints(base, seed))} stroke="#7ff6ff" strokeOpacity={opacity} strokeWidth={width} fill="none" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px #52e8ff) drop-shadow(0 0 14px #1fb6ff)' }} />
    </svg>
  )

  return (
    <div
      ref={root}
      className="pointer-events-none absolute inset-x-0 -top-[34px] h-[110px] overflow-hidden transition-opacity duration-[1600ms]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="glow-b absolute inset-0">
        <div className="absolute inset-0 animate-[shore-x_34s_linear_infinite_reverse]">{glowLine(52, 2.1, 3, 0.55)}</div>
      </div>
      <div className="glow-a absolute inset-0">
        <div className="absolute inset-0 animate-[shore-x_48s_linear_infinite]">{glowLine(42, 0, 4, 0.9)}</div>
      </div>
      {/* sparkling plankton */}
      <Twinkles
        count={26}
        layers={2}
        duration={1.8}
        dotClassName="size-1 bg-[#aefcff] shadow-[0_0_6px_2px_#52e8ff]"
        place={(i) => ({ left: `${(i * 37) % 100}%`, top: `${30 + ((i * 23) % 40)}px` })}
      />
    </div>
  )
}
