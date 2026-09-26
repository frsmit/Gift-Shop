import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { AnimatePresence, motion } from 'motion/react'
import { Sticker } from '../Sticker'
import { SunGlitter } from './SunGlitter'
import { cn } from '@/lib/utils'
import type { BeachMode } from '@/lib/nav'

/** Night sea: glowing jellyfish drifting under the moon, plus silver moonlight on the water. */
export function NightSea({ visible }: { visible: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-[1600ms]"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden
    >
      <SunGlitter className="left-[72%] w-[30vw] max-w-[360px]" glow="rgba(190,210,255,0.28)" glint="#e8f0ff" />
      {[
        { left: '14%', top: '58%', size: 'clamp(32px, 8vw, 52px)', delay: 0 },
        { left: '52%', top: '40%', size: 'clamp(28px, 7vw, 44px)', delay: 1.3 },
        { left: '86%', top: '74%', size: 'clamp(34px, 8.5vw, 56px)', delay: 0.6 },
      ].map((j, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2"
          style={{ left: j.left, top: j.top }}
          animate={{ y: [0, -18, 0], x: [0, i % 2 ? 8 : -8, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: j.delay }}
        >
          <div className="relative opacity-90">
            {/* glow: a gradient behind, far cheaper than filters on an animated sticker */}
            <span className="absolute -inset-[60%] rounded-full bg-[radial-gradient(circle,rgba(127,246,255,0.55)_0%,rgba(63,182,255,0.25)_40%,transparent_70%)]" />
            <Sticker name="jellyfish" size={j.size} className="relative" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/** A whale surfaces out past the bottles, spouts a couple of times, then dives (day & evening). */
export function Whale({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const q = gsap.utils.selector(root)
      let timer: ReturnType<typeof setTimeout>
      let alive = true

      const surface = () => {
        gsap.set(q('.w-anchor'), { left: `${gsap.utils.random(14, 60)}%` })
        gsap
          .timeline({
            // hidden between dives, so its animated image isn't decoding frames nobody sees
            onStart: () => void gsap.set(q('.w-body'), { visibility: 'visible' }),
            onComplete: () => {
              gsap.set(q('.w-body'), { visibility: 'hidden' })
              if (alive) timer = setTimeout(surface, gsap.utils.random(4000, 7000))
            },
          })
          // the sticker draws its body in the lower half and spouts on its own, so rise until
          // just the belly is under water, linger for a couple of spouts, then dive
          .fromTo(q('.w-body'), { yPercent: 100, y: 0 }, { yPercent: 10, y: 0, duration: 1.6, ease: 'sine.out' })
          .to(q('.w-body'), { yPercent: 100, duration: 1.6, ease: 'sine.in' }, '+=3.2')
      }

      timer = setTimeout(surface, 2500)
      return () => {
        alive = false
        clearTimeout(timer)
      }
    },
    { scope: root, dependencies: [active], revertOnUpdate: true },
  )

  return (
    <div ref={root} className="pointer-events-none absolute inset-x-0 top-[9%] h-0" aria-hidden>
      <div className="w-anchor absolute bottom-0 left-1/3">
        {/* whale, clipped at the waterline */}
        <div className="absolute bottom-0 left-1/2 h-[clamp(50px,11.5vw,78px)] w-[clamp(56px,13vw,88px)] -translate-x-1/2 overflow-hidden">
          <div className="w-body absolute left-0 top-0" style={{ transform: 'translateY(100%)', visibility: 'hidden' }}>
            <Sticker name="whale" size="clamp(56px, 13vw, 88px)" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Floating letters above a creature: "z z Z" when asleep, music notes when dancing. */
function Floaters({ chars, className }: { chars: string[]; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn('pointer-events-none absolute -right-3 -top-3', className)}>
      {chars.map((c, i) => (
        <span
          key={i}
          className="absolute font-marker font-semibold text-cream opacity-0 animate-[zzz_2.4s_ease-out_infinite] [text-shadow:0_1px_3px_rgba(14,59,92,0.5)]"
          style={{ animationDelay: `${i * 0.8}s`, fontSize: 14 + i * 4 }}
        >
          {c}
        </span>
      ))}
    </motion.div>
  )
}

/**
 * The crab has a routine: it wanders the sand by day, dances at sunset,
 * and curls up asleep at night (a still frame, so its claws stop waving).
 */
export function Crab({ mode }: { mode: BeachMode }) {
  const root = useRef<HTMLDivElement>(null)
  const walk = useRef<gsap.core.Timeline | null>(null)
  const legs = useRef<gsap.core.Tween | null>(null)
  const dance = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      walk.current = gsap
        .timeline({ repeat: -1, repeatDelay: 2, paused: true })
        .to('.crab', { x: '38vw', duration: 6, ease: 'sine.inOut' })
        .to('.crab', { scaleX: -1, duration: 0.2 })
        .to('.crab', { x: 0, duration: 6, ease: 'sine.inOut' }, '+=1')
        .to('.crab', { scaleX: 1, duration: 0.2 })
      legs.current = gsap.to('.crab-inner', { y: -3, duration: 0.16, yoyo: true, repeat: -1, paused: true })
      // side-step shuffle with a wiggle and a hop on the beat
      dance.current = gsap
        .timeline({ repeat: -1, paused: true, defaults: { ease: 'sine.inOut' } })
        .to('.crab-dance', { x: -12, rotate: -12, y: -4, duration: 0.3 })
        .to('.crab-dance', { y: 0, duration: 0.15 })
        .to('.crab-dance', { x: 12, rotate: 12, y: -4, duration: 0.3 })
        .to('.crab-dance', { y: 0, duration: 0.15 })
        .to('.crab-dance', { x: 0, rotate: 0, y: -14, duration: 0.25, ease: 'power2.out' })
        .to('.crab-dance', { y: 0, duration: 0.25, ease: 'bounce.out' })
    },
    { scope: root },
  )

  useEffect(() => {
    const walking = mode === 'day'
    const dancing = mode === 'evening'
    walk.current?.paused(!walking)
    legs.current?.paused(!walking)
    dance.current?.paused(!dancing)
    const q = gsap.utils.selector(root)
    if (!dancing) gsap.to(q('.crab-dance'), { x: 0, y: 0, rotate: 0, duration: 0.4 })
    if (!walking) gsap.to(q('.crab-inner'), { y: mode === 'night' ? 3 : 0, duration: 0.4 })
  }, [mode])

  return (
    <div ref={root} className="pointer-events-none absolute inset-0">
      <div className="crab absolute bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-[18%]">
        <div className="crab-dance">
          <div className={cn('crab-inner relative transition-[filter] duration-[1600ms]', mode === 'night' && 'brightness-75 saturate-75')}>
            <Sticker name={mode === 'night' ? 'crab-sleep' : 'crab'} size="clamp(38px, 9vw, 60px)" />
            <AnimatePresence>
              {mode === 'night' && <Floaters key="zzz" chars={['z', 'z', 'Z']} />}
              {mode === 'evening' && <Floaters key="notes" chars={['♪', '♫', '♪']} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/** At night the sea turtle crawls up out of the water and falls asleep on the sand. */
export function SleepyTurtle({ visible, className }: { visible: boolean; className?: string }) {
  const [asleep, setAsleep] = useState(false)

  return (
    <AnimatePresence onExitComplete={() => setAsleep(false)}>
      {visible && (
        <motion.div
          key="turtle"
          className={cn('pointer-events-none absolute -translate-x-1/2 -translate-y-1/2', className)}
          initial={{ y: -34, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -34, opacity: 0, transition: { duration: 1.2 } }}
          transition={{ duration: 3, ease: 'easeOut', delay: 0.8 }}
          onAnimationComplete={() => setAsleep(true)}
        >
          {/* waddle while crawling, then lie still */}
          <motion.div
            animate={asleep ? { rotate: 0 } : { rotate: [-5, 5, -5] }}
            transition={asleep ? { duration: 0.4 } : { duration: 0.7, repeat: Infinity }}
            className="relative brightness-75 saturate-75"
          >
            <Sticker name={asleep ? 'turtle-sleep' : 'turtle'} size="clamp(40px, 10vw, 62px)" />
            <AnimatePresence>{asleep && <Floaters key="zzz" chars={['z', 'z', 'Z']} className="-right-1 -top-4" />}</AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const modeIcon: Record<BeachMode, string> = { day: '☀️', evening: '🌅', night: '🌙' }

/** A coconut that fell from the palm. Tap it to change the time of day. */
export function CoconutToggle({ mode, onToggle, className }: { mode: BeachMode; onToggle: () => void; className?: string }) {
  const [spins, setSpins] = useState(0)
  const [used, setUsed] = useState(false)

  return (
    <div className={cn('pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2', className)}>
      <motion.button
        type="button"
        onClick={() => {
          setSpins((s) => s + 1)
          setUsed(true)
          onToggle()
        }}
        aria-label={`Change time of day (now ${mode})`}
        animate={{ rotate: spins * 360 }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className={cn('relative block transition-[filter] duration-[1600ms]', mode === 'night' && 'brightness-75')}
      >
        <svg viewBox="0 0 40 40" className="w-[clamp(36px,9vw,52px)] drop-shadow-[0_4px_3px_rgba(90,60,30,0.4)]">
          <circle cx="20" cy="21" r="17" fill="#7a4d27" />
          <path d="M8 12 Q 20 4 32 12" stroke="#5e3a1c" strokeWidth="2" fill="none" />
          <path d="M5 22 Q 20 16 35 22" stroke="#5e3a1c" strokeWidth="1.5" fill="none" opacity="0.7" />
          <circle cx="15" cy="12" r="2.2" fill="#3c2410" />
          <circle cx="21" cy="10.5" r="2.2" fill="#3c2410" />
          <circle cx="18" cy="16" r="2.2" fill="#3c2410" />
          <ellipse cx="13" cy="26" rx="4" ry="2" fill="#a2703f" opacity="0.6" />
        </svg>
      </motion.button>
      {/* current mode badge */}
      <span className="pointer-events-none absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-cream text-sm shadow ring-1 ring-[#e2c79b]">
        {modeIcon[mode]}
      </span>
      <AnimatePresence>
        {!used && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 4 }}
            className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream/90 px-2 py-0.5 font-hand text-sm text-ocean shadow"
          >
            tap me 🥥
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
