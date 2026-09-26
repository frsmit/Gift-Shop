import { cn } from '@/lib/utils'

// Sunlight on moving water: a soft glow plus lots of little curved glints that flicker.
// The column narrows toward the horizon and widens toward the viewer.
const GLINTS = Array.from({ length: 54 }, (_, i) => {
  const depth = ((i * 37) % 100) / 100 // 0 = horizon, 1 = near
  const spread = 12 + depth * 38 // half-width of the column, in %
  const jitter = ((i * 53) % 100) / 100 - 0.5
  return {
    x: 50 + jitter * spread * 2,
    y: 1 + depth * 92,
    w: 5 + depth * 30 + ((i * 17) % 9),
    delay: ((i * 7) % 13) * 0.18,
    duration: 1.3 + ((i * 11) % 7) * 0.25,
  }
})

export function SunGlitter({ className, glow = 'rgba(255,248,215,0.6)', glint = '#fffbe8' }: { className?: string; glow?: string; glint?: string }) {
  return (
    <div className={cn('pointer-events-none absolute top-0 h-full -translate-x-1/2', className)} aria-hidden>
      <div
        className="absolute inset-0 animate-[shimmer_5s_ease-in-out_infinite]"
        style={{ background: `radial-gradient(ellipse 38% 100% at 50% 0%, ${glow}, transparent 72%)` }}
      />
      {GLINTS.map((g, i) => (
        <svg
          key={i}
          viewBox="0 0 40 8"
          preserveAspectRatio="none"
          className="absolute -translate-x-1/2 animate-[glint_1.6s_ease-in-out_infinite]"
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            width: g.w,
            height: Math.max(3, g.w / 7),
            animationDelay: `${g.delay}s`,
            animationDuration: `${g.duration}s`,
          }}
        >
          <path d="M1 6 Q 20 -1 39 6" stroke={glint} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  )
}
