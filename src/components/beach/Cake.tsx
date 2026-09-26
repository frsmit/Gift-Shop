import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { lite } from '@/lib/perf'
import { cn } from '@/lib/utils'

// Tap to blow out the candles: GSAP puffs each flame out and sends smoke curling up.
export function Cake({ onBlown }: { onBlown: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [blown, setBlown] = useState(false)
  const { contextSafe } = useGSAP({ scope: ref })

  const blow = contextSafe(() => {
    if (blown) return
    setBlown(true)
    gsap
      .timeline({ onComplete: onBlown })
      .to('.cake-body', { scaleX: 1.04, scaleY: 0.96, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: '50% 100%' })
      .to('.flame', { scaleY: 0.2, scaleX: 1.6, x: 6, opacity: 0, duration: 0.35, ease: 'power2.in', stagger: 0.12 }, 0)
      .fromTo(
        '.smoke',
        { y: 0, opacity: 0.8, scale: 0.4 },
        { y: -70, x: 'random(-18, 18)', opacity: 0, scale: 1.8, duration: 1.4, ease: 'sine.out', stagger: 0.08 },
        0.25,
      )
  })

  const candles = [70, 100, 130]

  return (
    <button ref={ref} type="button" onClick={blow} aria-label="Blow out the candles" className="relative outline-none">
      <svg viewBox="0 0 200 190" className={cn('w-[clamp(170px,46vw,260px)] overflow-visible', !lite && 'drop-shadow-[0_18px_24px_rgba(30,20,60,0.45)]')}>
        <defs>
          <radialGradient id="flame" cx="50%" cy="70%" r="60%">
            <stop offset="0" stopColor="#fffbe6" />
            <stop offset="0.45" stopColor="#ffd27a" />
            <stop offset="1" stopColor="#ff7a45" />
          </radialGradient>
        </defs>

        {/* plate */}
        <ellipse cx="100" cy="178" rx="92" ry="10" fill="#fff8ec" opacity="0.95" />

        <g className="cake-body">
          {/* bottom tier */}
          <rect x="22" y="112" width="156" height="62" rx="12" fill="#fff4dc" />
          <path d="M22 124 Q40 140 58 124 T94 124 T130 124 T166 124 L178 124 L178 118 Q178 112 170 112 L30 112 Q22 112 22 118 Z" fill="#5cc8d7" />
          <rect x="22" y="150" width="156" height="6" fill="#ffc49b" opacity="0.8" />
          {/* top tier */}
          <rect x="46" y="72" width="108" height="44" rx="10" fill="#fff8ec" />
          <path d="M46 84 Q60 98 74 84 T102 84 T130 84 T154 84 L154 80 Q154 72 146 72 L54 72 Q46 72 46 80 Z" fill="#ff8a65" />
          {/* sprinkles */}
          {[
            [40, 140, '#1b8eb0'],
            [70, 162, '#ff8a65'],
            [110, 142, '#ffd27a'],
            [150, 160, '#1b8eb0'],
            [160, 138, '#ff8a65'],
            [66, 104, '#1b8eb0'],
            [120, 102, '#5cc8d7'],
            [96, 108, '#ffd27a'],
          ].map(([x, y, c], i) => (
            <rect key={i} x={x as number} y={y as number} width="8" height="3" rx="1.5" fill={c as string} transform={`rotate(${i * 37} ${x} ${y})`} />
          ))}
        </g>

        {candles.map((x, i) => (
          <g key={x}>
            <rect x={x - 4} y="40" width="8" height="34" rx="3" fill={i === 1 ? '#5cc8d7' : '#fff8ec'} stroke="#e2c79b" strokeWidth="1" />
            <path d={`M${x - 4} 50 l8 -6 M${x - 4} 60 l8 -6 M${x - 4} 70 l8 -6`} stroke={i === 1 ? '#fff8ec' : '#ff8a65'} strokeWidth="2" />
            <line x1={x} y1="40" x2={x} y2="34" stroke="#3b2f2f" strokeWidth="1.5" />
            <g className="flame" style={{ transformOrigin: `${x}px 36px`, transformBox: 'view-box' }}>
              <path
                d={`M${x} 14 C ${x + 8} 24 ${x + 8} 32 ${x} 36 C ${x - 8} 32 ${x - 8} 24 ${x} 14 Z`}
                fill="url(#flame)"
                className="origin-bottom animate-[flicker_0.6s_ease-in-out_infinite]"
                style={{ transformBox: 'fill-box', animationDelay: `${i * 0.15}s` }}
              />
            </g>
            {[0, 1, 2].map((k) => (
              <circle key={k} className="smoke" cx={x} cy={30} r="5" fill="#e8e3f0" opacity="0" />
            ))}
          </g>
        ))}
      </svg>
      {!blown && <span className="absolute inset-0 animate-ping rounded-full bg-peach/10" aria-hidden />}
    </button>
  )
}
