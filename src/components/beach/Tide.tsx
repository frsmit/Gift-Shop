import type { Ref } from 'react'
import { Sticker } from './Sticker'

// A wave that washes over the screen between pages. App drives it with Motion's useAnimate.
export function Tide({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 -top-[120px] z-50 h-[calc(100dvh+140px)] will-change-transform"
      style={{ transform: 'translateY(105%)' }}
    >
      {/* Wavy crest with foam */}
      <svg className="absolute inset-x-0 top-0 h-[120px] w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="tide-crest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fd6e3" />
            <stop offset="1" stopColor="#2aa3c4" />
          </linearGradient>
        </defs>
        <path
          d="M0 70 C 180 20 300 110 480 70 S 780 20 960 64 S 1260 110 1440 60 V120 H0Z"
          fill="url(#tide-crest)"
        />
        <path
          d="M0 70 C 180 20 300 110 480 70 S 780 20 960 64 S 1260 110 1440 60"
          fill="none"
          stroke="#f4fdfd"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
      <div className="absolute inset-x-0 top-[118px] bottom-0 bg-[linear-gradient(180deg,#2aa3c4_0%,#15789e_45%,#0e3b5c_100%)]">
        {/* Foam bubbles */}
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="absolute rounded-full border border-white/60 bg-white/15"
            style={{
              left: `${(i * 71) % 100}%`,
              top: `${(i * 37) % 90}%`,
              width: 6 + ((i * 13) % 18),
              height: 6 + ((i * 13) % 18),
            }}
          />
        ))}
        <div className="absolute inset-x-0 top-[35%] flex flex-col items-center gap-3">
          <Sticker name="dolphin" size="clamp(72px, 18vw, 120px)" eager />
          <p className="font-hand text-xl tracking-wide text-foam/90">riding the next wave...</p>
        </div>
      </div>
    </div>
  )
}
