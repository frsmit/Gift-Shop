import { motion } from 'motion/react'
import type { TimeOfDay } from '@/lib/nav'
import { SunGlitter } from './shore/SunGlitter'
import { Twinkles } from './Twinkles'

type Palette = {
  sky: [string, string, string]
  sun: string
  glow: string
  sunTop: string
  sea: [string, string]
  foam: string
  cloud: number
  stars: number
}

const palettes: Record<TimeOfDay, Palette> = {
  dawn: {
    sky: ['#26345f', '#6f6aa3', '#f2ad9c'],
    sun: '#ffd4a3',
    glow: 'rgba(255,190,150,0.55)',
    sunTop: '66%',
    sea: ['#3d5b86', '#1d2f55'],
    foam: 'rgba(255,220,210,0.55)',
    cloud: 0.35,
    stars: 0.9,
  },
  morning: {
    sky: ['#79c4ea', '#bfe6f4', '#fff2de'],
    sun: '#fff6cf',
    glow: 'rgba(255,245,200,0.7)',
    sunTop: '14%',
    sea: ['#4db4d3', '#197fa3'],
    foam: 'rgba(255,255,255,0.75)',
    cloud: 0.95,
    stars: 0,
  },
  noon: {
    sky: ['#4aaee6', '#9bd8f1', '#e6f7fa'],
    sun: '#fffbe8',
    glow: 'rgba(255,255,230,0.75)',
    sunTop: '8%',
    sea: ['#3cb0d0', '#12739a'],
    foam: 'rgba(255,255,255,0.8)',
    cloud: 1,
    stars: 0,
  },
  afternoon: {
    sky: ['#68b8e2', '#c6e5ee', '#ffe6c2'],
    sun: '#fff0c2',
    glow: 'rgba(255,230,170,0.7)',
    sunTop: '20%',
    sea: ['#48a9c9', '#1a6f93'],
    foam: 'rgba(255,250,240,0.75)',
    cloud: 0.85,
    stars: 0,
  },
  golden: {
    sky: ['#86a9cf', '#f3c095', '#ffd892'],
    sun: '#ffd27a',
    glow: 'rgba(255,200,110,0.75)',
    sunTop: '38%',
    sea: ['#5d9cbc', '#27658a'],
    foam: 'rgba(255,230,190,0.7)',
    cloud: 0.7,
    stars: 0,
  },
  sunset: {
    sky: ['#34336e', '#b8577c', '#ff9a66'],
    sun: '#ff9150',
    glow: 'rgba(255,140,90,0.75)',
    sunTop: '55%',
    sea: ['#6a5a8f', '#2a3262'],
    foam: 'rgba(255,190,170,0.6)',
    cloud: 0.55,
    stars: 0.35,
  },
}

const ease = [0.45, 0, 0.2, 1] as const
const t = { duration: 1.8, ease }

const wavePath = (amp: number, y: number) =>
  `M0 ${y} Q 150 ${y - amp} 300 ${y} T 600 ${y} T 900 ${y} T 1200 ${y} T 1500 ${y} T 1800 ${y} T 2100 ${y} T 2400 ${y} V 200 H 0 Z`

export function Scene({ time }: { time: TimeOfDay }) {
  const p = palettes[time]

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Sky */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ background: `linear-gradient(180deg, ${p.sky[0]} 0%, ${p.sky[1]} 45%, ${p.sky[2]} 68%)` }}
        transition={t}
      />

      {/* Stars (dawn / sunset) */}
      <motion.div className="absolute inset-x-0 top-0 h-1/2" initial={false} animate={{ opacity: p.stars }} transition={t}>
        {p.stars > 0 && (
          <Twinkles count={28} dotClassName="size-[2px] bg-white" place={(i) => ({ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 90}%` })} />
        )}
      </motion.div>

      {/* Sun */}
      <motion.div
        className="absolute left-[72%] size-[clamp(70px,16vw,150px)] -translate-x-1/2 rounded-full"
        initial={false}
        animate={{
          top: p.sunTop,
          backgroundColor: p.sun,
          boxShadow: `0 0 60px 20px ${p.glow}, 0 0 160px 60px ${p.glow}`,
        }}
        transition={t}
      />

      {/* Clouds */}
      <motion.div className="absolute inset-x-0 top-[6%] h-[40%]" initial={false} animate={{ opacity: p.cloud }} transition={t}>
        <Cloud className="top-[8%] w-[38vw] max-w-[320px] animate-[drift_70s_linear_infinite]" delay={-10} />
        <Cloud className="top-[30%] w-[26vw] max-w-[220px] opacity-80 animate-[drift_95s_linear_infinite]" delay={-55} />
        <Cloud className="top-[55%] w-[30vw] max-w-[260px] opacity-70 animate-[drift_85s_linear_infinite]" delay={-30} />
      </motion.div>

      {/* Seagulls */}
      <div className="absolute inset-x-0 top-[18%] h-24">
        <Gull className="animate-[glide_28s_linear_infinite]" delay={-4} />
        <Gull className="top-8 scale-75 animate-[glide_34s_linear_infinite]" delay={-18} />
      </div>

      {/* Sea */}
      <div className="absolute inset-x-0 bottom-0 h-[34%]">
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ background: `linear-gradient(180deg, ${p.sea[0]} 0%, ${p.sea[1]} 100%)` }}
          transition={t}
        />
        {/* Sunlight glittering on the water, tinted by the time of day */}
        <SunGlitter key={time} className="left-[72%] w-[32vw] max-w-[380px]" glow={p.glow} glint={p.sun} />
        {/* Layered waves */}
        {[
          { cls: 'top-[-26px] animate-[wave-x_18s_linear_infinite]', amp: 14, opacity: 0.35 },
          { cls: 'top-[18%] animate-[wave-x_13s_linear_infinite_reverse]', amp: 10, opacity: 0.25 },
          { cls: 'top-[46%] animate-[wave-x_22s_linear_infinite]', amp: 12, opacity: 0.2 },
        ].map((w, i) => (
          <svg
            key={i}
            className={`absolute left-0 h-[60px] w-[200%] ${w.cls}`}
            viewBox="0 0 2400 200"
            preserveAspectRatio="none"
          >
            <motion.path
              d={wavePath(w.amp * 3, 40)}
              initial={false}
              animate={{ fill: p.foam }}
              transition={t}
              style={{ opacity: w.opacity }}
            />
          </svg>
        ))}
      </div>
    </div>
  )
}

export function Cloud({ className, delay }: { className: string; delay: number }) {
  return (
    <svg
      viewBox="0 0 200 70"
      className={`absolute left-0 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <path
        d="M30 60 Q8 60 10 45 Q12 30 32 32 Q36 12 60 16 Q72 2 96 10 Q116 0 132 18 Q156 12 164 32 Q190 30 190 48 Q190 62 168 60 Z"
        fill="#ffffff"
        opacity="0.92"
      />
    </svg>
  )
}

export function Gull({ className, delay }: { className: string; delay: number }) {
  return (
    <svg
      viewBox="0 0 40 16"
      className={`absolute left-0 w-8 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <path
        d="M2 10 Q10 2 20 9 Q30 2 38 10"
        fill="none"
        stroke="#27415e"
        strokeWidth="2"
        strokeLinecap="round"
        className="origin-center animate-[flap_0.9s_ease-in-out_infinite]"
      />
    </svg>
  )
}
