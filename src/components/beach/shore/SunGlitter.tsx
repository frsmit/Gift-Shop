import { lite } from '@/lib/perf'
import { cn } from '@/lib/utils'

// Sunlight on moving water: a soft glow plus little curved glints. The column narrows toward
// the horizon and widens toward the viewer. For performance the glints don't animate one by
// one: they're split across three layers and each layer fades in and out (a cheap, GPU-only
// opacity animation), which reads as flickering sparkles.
const COUNT = lite ? 30 : 54
const LAYERS = 3

const GLINTS = Array.from({ length: COUNT }, (_, i) => {
  const depth = ((i * 37) % 100) / 100 // 0 = horizon, 1 = near
  const spread = 12 + depth * 38 // half-width of the column, in %
  const jitter = ((i * 53) % 100) / 100 - 0.5
  return { x: 50 + jitter * spread * 2, y: 1 + depth * 92, w: 5 + depth * 30 + ((i * 17) % 9) }
})

export function SunGlitter({ className, glow = 'rgba(255,248,215,0.6)', glint = '#fffbe8' }: { className?: string; glow?: string; glint?: string }) {
  return (
    <div className={cn('pointer-events-none absolute top-0 h-full -translate-x-1/2', className)} aria-hidden>
      <div
        className="absolute inset-0 animate-[glow-pulse_5s_ease-in-out_infinite]"
        style={{ background: `radial-gradient(ellipse 38% 100% at 50% 0%, ${glow}, transparent 72%)` }}
      />
      {Array.from({ length: LAYERS }, (_, layer) => (
        <div
          key={layer}
          className="absolute inset-0 animate-[twinkle_1.8s_ease-in-out_infinite]"
          style={{ animationDelay: `${layer * 0.6}s` }}
        >
          {GLINTS.filter((_, i) => i % LAYERS === layer).map((g, i) => (
            <svg
              key={i}
              viewBox="0 0 40 8"
              preserveAspectRatio="none"
              className="absolute -translate-x-1/2"
              style={{ left: `${g.x}%`, top: `${g.y}%`, width: g.w, height: Math.max(3, g.w / 7) }}
            >
              <path d="M1 6 Q 20 -1 39 6" stroke={glint} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            </svg>
          ))}
        </div>
      ))}
    </div>
  )
}
