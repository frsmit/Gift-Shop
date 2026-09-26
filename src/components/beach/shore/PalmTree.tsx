import { cn } from '@/lib/utils'
import type { BeachMode } from '@/lib/nav'

// Colours per time of day (cheaper than a CSS filter over the swaying fronds)
const palettes: Record<BeachMode, { trunk: string; shade: string; ring: string; leafA: string; leafB: string; rib: string; nutA: string; nutB: string }> = {
  day: { trunk: '#a8743f', shade: '#8a5a2e', ring: '#7a4e27', leafA: '#3bb57d', leafB: '#2c9a69', rib: '#1f7a52', nutA: '#6e4524', nutB: '#7d5130' },
  evening: { trunk: '#8e5a3a', shade: '#6f4228', ring: '#5e3620', leafA: '#6a9a55', leafB: '#57854a', rib: '#3d6a3a', nutA: '#5a3520', nutB: '#664028' },
  night: { trunk: '#2c2b40', shade: '#232236', ring: '#1b1a2c', leafA: '#1f3a3c', leafB: '#193234', rib: '#122628', nutA: '#1d1a28', nutB: '#221f2e' },
}

const CROWN = { x: 150, y: 96 }
// Frond angles in degrees (0 = pointing right, -90 = up). Side fronds droop.
const FRONDS = [-172, -140, -108, -78, -48, -16, 14, 168, 196]

// Two stacked SVGs: a still trunk, and the fronds as their own layer that sways as a whole
// (a transform on the <svg> element, which the GPU can animate without repainting).
export function PalmTree({ className, flip = false, speed = 5, mode = 'day' }: { className?: string; flip?: boolean; speed?: number; mode?: BeachMode }) {
  const c = palettes[mode]
  const svgCls = 'absolute inset-0 h-full w-full overflow-visible [&_*]:transition-[fill,stroke] [&_*]:duration-[1600ms]'
  return (
    <div className={cn('pointer-events-none aspect-[260/420]', flip && '-scale-x-100', className)} aria-hidden>
      <svg viewBox="0 0 260 420" className={svgCls}>
        <path d="M104 420 C 110 320, 126 200, 142 98 L 160 102 C 148 204, 136 322, 134 420 Z" fill={c.trunk} />
        <path d="M118 420 C 122 320, 134 210, 148 100 L 156 101 C 144 210, 134 320, 130 420 Z" fill={c.shade} opacity="0.5" />
        {Array.from({ length: 14 }, (_, i) => {
          const t = i / 14
          const y = 410 - t * 300
          const x = 118 + t * 32
          return <path key={i} d={`M${x - 12} ${y} q 13 -7 26 0`} stroke={c.ring} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        })}
      </svg>
      <svg
        viewBox="0 0 260 420"
        className={svgCls}
        style={{
          transformOrigin: `${(CROWN.x / 260) * 100}% ${(CROWN.y / 420) * 100}%`,
          animation: `sway ${speed}s ease-in-out infinite`,
        }}
      >
        {FRONDS.map((a, i) => {
          const pointsLeft = a < -90 || a > 90
          return (
            <g key={a} transform={`translate(${CROWN.x} ${CROWN.y}) rotate(${a})${pointsLeft ? ' scale(1 -1)' : ''}`}>
              <path
                d="M0 0 C 34 -26, 86 -26, 128 16 C 118 12, 108 14, 100 20 C 94 10, 82 10, 74 18 C 68 8, 54 8, 46 14 C 40 6, 26 6, 0 0 Z"
                fill={i % 2 ? c.leafA : c.leafB}
              />
              <path d="M0 0 C 40 -20, 88 -18, 126 14" stroke={c.rib} strokeWidth="2" fill="none" />
            </g>
          )
        })}
        {/* coconuts */}
        <circle cx="144" cy="104" r="8" fill={c.nutA} />
        <circle cx="158" cy="106" r="8" fill={c.nutB} />
        <circle cx="151" cy="115" r="7.5" fill={c.nutA} />
      </svg>
    </div>
  )
}

export function Umbrella({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 150" className={cn('pointer-events-none overflow-visible', className)} aria-hidden>
      {/* towel */}
      <g transform="rotate(-8 90 128)">
        <rect x="30" y="112" width="110" height="34" rx="4" fill="#5cc8d7" />
        <rect x="30" y="120" width="110" height="5" fill="#fff8ec" />
        <rect x="30" y="132" width="110" height="5" fill="#fff8ec" />
      </g>
      {/* shadow */}
      <ellipse cx="96" cy="122" rx="60" ry="8" fill="#b08a55" opacity="0.25" />
      {/* pole */}
      <line x1="88" y1="26" x2="98" y2="126" stroke="#8a5a2e" strokeWidth="4" strokeLinecap="round" />
      {/* canopy */}
      <path d="M14 58 Q 86 -8 160 58 Q 142 50 124 58 Q 106 50 87 58 Q 68 50 50 58 Q 32 50 14 58 Z" fill="#ff8a65" />
      <path d="M50 58 Q 60 20 87 12 Q 70 30 68 55 Z" fill="#fff8ec" />
      <path d="M124 58 Q 116 22 87 12 Q 104 30 106 55 Z" fill="#fff8ec" />
      <circle cx="87" cy="12" r="4" fill="#0e3b5c" />
    </svg>
  )
}
