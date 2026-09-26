import { SunGlitter } from './SunGlitter'
import { Twinkles } from '../Twinkles'
import type { BeachMode } from '@/lib/nav'

// Tropical water: turquoise near the horizon, deep blue in the middle, clear shallows by the shore.
export function Sea({ mode = 'day' }: { mode?: BeachMode }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#9ee0ec_0%,#4dbad6_14%,#1f93bb_50%,#2aa8c8_78%,#6fd3dc_100%)]" />
        {/* horizon haze */}
        <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/60 to-transparent" />

        {/* sunlight glittering on the water (sun sits at ~72% across in the sky) */}
        <SunGlitter className="left-[72%] w-[34vw] max-w-[420px]" />

        {/* drifting wave lines, smaller near the horizon for depth */}
        {[
          { top: '6%', h: 14, speed: 26, o: 0.35 },
          { top: '16%', h: 18, speed: 22, o: 0.3, rev: true },
          { top: '30%', h: 24, speed: 18, o: 0.28 },
          { top: '46%', h: 30, speed: 16, o: 0.25, rev: true },
          { top: '64%', h: 36, speed: 14, o: 0.3 },
          { top: '82%', h: 42, speed: 12, o: 0.35, rev: true },
        ].map((w, i) => (
          <svg
            key={i}
            className="absolute left-0 w-[200%]"
            style={{
              top: w.top,
              height: w.h,
              opacity: w.o,
              animation: `wave-x ${w.speed}s linear infinite${w.rev ? ' reverse' : ''}`,
            }}
            viewBox="0 0 2400 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0 20 Q 75 6 150 20 T 300 20 T 450 20 T 600 20 T 750 20 T 900 20 T 1050 20 T 1200 20 T 1350 20 T 1500 20 T 1650 20 T 1800 20 T 1950 20 T 2100 20 T 2250 20 T 2400 20"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        ))}

        {/* glints */}
        <Twinkles count={18} layers={2} duration={2.6} dotClassName="size-1 bg-white" place={(i) => ({ left: `${(i * 41) % 100}%`, top: `${8 + ((i * 29) % 85)}%` })} />
      </div>

      {/* sailboat drifting along the horizon (it sits above the light tint, so it's shaded here; home by night) */}
      <div
        className="absolute left-0 top-0 -translate-y-[88%] animate-[sail_90s_linear_infinite] transition-[opacity,filter] duration-[1600ms]"
        style={{
          animationDelay: '-30s',
          opacity: mode === 'night' ? 0 : 1,
          filter: mode === 'evening' ? 'sepia(0.5) saturate(1.4) brightness(0.8)' : undefined,
        }}
      >
        <svg viewBox="0 0 60 50" className="w-[clamp(34px,7vw,56px)] animate-[bob_3.5s_ease-in-out_infinite]">
          <path d="M30 4 L30 38 L10 38 Z" fill="#fff8ec" />
          <path d="M32 10 L32 38 L48 38 Z" fill="#ff8a65" />
          <path d="M6 40 H54 L46 48 H14 Z" fill="#0e3b5c" />
        </svg>
      </div>
    </div>
  )
}
