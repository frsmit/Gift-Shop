import { AnimatePresence, motion } from 'motion/react'
import { Cloud, Gull } from '../Scene'
import { Twinkles } from '../Twinkles'
import { lite } from '@/lib/perf'
import type { BeachMode } from '@/lib/nav'
import { cn } from '@/lib/utils'

const t = { duration: 1.8, ease: [0.45, 0, 0.2, 1] as const }

const skies: Record<BeachMode, [string, string, string]> = {
  day: ['#4aaee6', '#8fd2f0', '#e2f5f8'],
  evening: ['#2f2d6b', '#c4617f', '#ffb36b'],
  night: ['#040a22', '#0f1c47', '#23386d'],
}

// The celestial body: bright sun by day, big orange sun sinking into the sea at evening,
// a cratered moon at night. It sits in a box that ends at the horizon, so the evening sun
// actually sets behind the sea.
const bodies: Record<BeachMode, { top: string; color: string; glow: string; scale: number }> = {
  day: { top: 'top-[16%]', color: '#fffbe8', glow: 'rgba(255,250,215,0.75)', scale: 1 },
  // evening: about two thirds of the sun above the horizon, the rest already set
  evening: { top: 'top-[calc(100%-clamp(40px,9.5vw,80px))]', color: '#ff8f4f', glow: 'rgba(255,140,80,0.8)', scale: 1.25 },
  night: { top: 'top-[18%]', color: '#f2f0e3', glow: 'rgba(190,210,255,0.45)', scale: 0.85 },
}

const STARS = Array.from({ length: lite ? 40 : 60 }, (_, i) => ({
  left: (i * 37 + (i % 7) * 11) % 100,
  top: (i * 53 + (i % 5) * 7) % 100,
  size: i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  delay: (i % 11) * 0.3,
}))

export function BeachSky({ mode, onToggle }: { mode: BeachMode; onToggle: () => void }) {
  const [c0, c1, c2] = skies[mode]
  const body = bodies[mode]

  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ background: `linear-gradient(180deg, ${c0} 0%, ${c1} 18%, ${c2} 33%, ${c2} 100%)` }}
        transition={t}
      />

      {/* the sky box ends at the horizon */}
      <div className="absolute inset-x-0 top-0 h-[max(31%,15.5rem)] overflow-hidden md:h-[max(34%,15rem)]">
        {/* stars */}
        <motion.div className="absolute inset-0" initial={false} animate={{ opacity: mode === 'night' ? 1 : mode === 'evening' ? 0.3 : 0 }} transition={t}>
          {mode !== 'day' && (
            <Twinkles
              count={STARS.length}
              dotClassName="bg-white"
              place={(i) => ({ left: `${STARS[i].left}%`, top: `${STARS[i].top * 0.85}%`, width: STARS[i].size, height: STARS[i].size })}
            />
          )}
        </motion.div>

        {/* shooting stars at night */}
        {mode === 'night' &&
          [0, 1].map((i) => (
            <span
              key={i}
              className="absolute h-[2px] w-24 rounded-full bg-gradient-to-l from-white to-transparent opacity-0 animate-[shooting_9s_linear_infinite]"
              style={{ left: `${30 + i * 35}%`, top: `${10 + i * 12}%`, animationDelay: `${2 + i * 4.5}s` }}
            />
          ))}

        {/* clouds */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: mode === 'day' ? 0.95 : mode === 'evening' ? 0.55 : 0.12 }}
          transition={t}
          style={{ filter: mode === 'evening' ? 'sepia(0.5) saturate(2) hue-rotate(-20deg)' : undefined }}
        >
          <Cloud className="top-[12%] w-[34vw] max-w-[300px] animate-[drift_80s_linear_infinite]" delay={-20} />
          <Cloud className="top-[46%] w-[24vw] max-w-[200px] opacity-80 animate-[drift_100s_linear_infinite]" delay={-60} />
        </motion.div>

        {/* the sun / moon — tap to change the time of day */}
        <motion.button
          type="button"
          onClick={onToggle}
          aria-label={`Change time of day (now ${mode})`}
          className={cn(
            'pointer-events-auto absolute left-[72%] size-[clamp(58px,14vw,120px)] -translate-x-1/2 rounded-full outline-none transition-[top] duration-[1800ms] ease-in-out',
            body.top,
          )}
          initial={false}
          animate={{ backgroundColor: body.color, scale: body.scale, boxShadow: `0 0 50px 18px ${body.glow}, 0 0 140px 50px ${body.glow}` }}
          whileTap={{ scale: body.scale * 0.9 }}
          transition={t}
        >
          <motion.span className="absolute inset-0" initial={false} animate={{ opacity: mode === 'night' ? 1 : 0 }} transition={t}>
            <span className="absolute left-[22%] top-[28%] size-[18%] rounded-full bg-[#d9d5c3]" />
            <span className="absolute left-[56%] top-[48%] size-[24%] rounded-full bg-[#dcd8c6]" />
            <span className="absolute left-[34%] top-[64%] size-[12%] rounded-full bg-[#d9d5c3]" />
          </motion.span>
        </motion.button>

        {/* birds: gulls by day, a flock heading home at evening */}
        <AnimatePresence>
          {mode === 'day' && (
            <motion.div key="gulls" className="absolute inset-x-0 top-[34%] h-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Gull className="animate-[glide_26s_linear_infinite]" delay={-6} />
              <Gull className="top-6 scale-75 animate-[glide_33s_linear_infinite]" delay={-17} />
            </motion.div>
          )}
          {mode === 'evening' && (
            <motion.div key="flock" className="absolute inset-x-0 top-[26%] h-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute left-0 animate-[glide_24s_linear_infinite]" style={{ animationDelay: '-4s' }}>
                <Flock />
              </div>
              <div className="absolute left-0 top-10 scale-75 animate-[glide_32s_linear_infinite]" style={{ animationDelay: '-18s' }}>
                <Flock />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Flock() {
  const birds = [
    [0, 0],
    [16, 8],
    [32, 16],
    [16, -8],
    [32, -16],
    [48, 24],
  ]
  return (
    <div className="relative h-12 w-16 -scale-x-100">
      {birds.map(([x, y], i) => (
        <svg key={i} viewBox="0 0 40 16" className="absolute w-5" style={{ left: x, top: 20 + y }}>
          <path
            d="M2 10 Q10 2 20 9 Q30 2 38 10"
            fill="none"
            stroke="#2a1d3d"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="origin-center animate-[flap_0.8s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        </svg>
      ))}
    </div>
  )
}
