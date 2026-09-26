import { useEffect, useRef } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { motion } from 'motion/react'
import { Sticker } from '../Sticker'
import { cn } from '@/lib/utils'

// Ball physics tuning (px, seconds)
const GRAVITY = 2400
const BOUNCE = 0.62 // energy kept on each bounce off the sand
const WALL_BOUNCE = 0.72
const ROLL_DRAG = 1.4 // how quickly rolling slows down
const MAX_THROW = 2800

/**
 * A beach ball with real-ish physics: gravity, bouncing, rolling friction, spin that matches
 * the distance travelled, walls at the screen edges, and a squash (React Spring) when it lands.
 * Drag and throw it (use-gesture gives the release velocity), or tap it to kick it up.
 */
export function BeachBall({ className }: { className?: string }) {
  const anchor = useRef<HTMLDivElement>(null)
  const ball = useRef<HTMLDivElement>(null)
  const rotor = useRef<HTMLDivElement>(null)
  const shadow = useRef<HTMLDivElement>(null)
  const sim = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0, dragging: false, raf: 0, last: 0, bounds: { minX: 0, maxX: 0, minY: 0 }, r: 24 })
  const [{ sx, sy }, squash] = useSpring(() => ({ sx: 1, sy: 1 }))

  const render = () => {
    const st = sim.current
    if (ball.current) ball.current.style.transform = `translate(${st.x}px, ${st.y}px)`
    if (rotor.current) rotor.current.style.transform = `rotate(${st.angle}deg)`
    if (shadow.current) {
      const lift = Math.max(0.3, 1 + st.y / 320)
      shadow.current.style.transform = `translateX(calc(-50% + ${st.x}px)) scale(${lift})`
      shadow.current.style.opacity = String(lift)
    }
  }

  const measure = () => {
    const st = sim.current
    const rect = anchor.current!.getBoundingClientRect()
    const size = ball.current!.offsetWidth
    st.r = size / 2
    st.bounds = { minX: -rect.left + 4, maxX: window.innerWidth - rect.left - size - 4, minY: -rect.top + 8 }
  }

  const step = (now: number) => {
    const st = sim.current
    const dt = Math.min(0.033, (now - st.last) / 1000)
    st.last = now
    if (!st.dragging) {
      st.vy += GRAVITY * dt
      st.x += st.vx * dt
      st.y += st.vy * dt

      // sand
      if (st.y >= 0) {
        st.y = 0
        if (st.vy > 140) {
          const k = Math.min(0.32, st.vy / 3200)
          squash.start({ from: { sx: 1 + k, sy: 1 - k }, to: { sx: 1, sy: 1 }, config: { tension: 520, friction: 11 } })
          st.vy = -st.vy * BOUNCE
          st.vx *= 0.9
        } else {
          st.vy = 0
        }
      }
      if (st.y === 0 && st.vy === 0) st.vx *= Math.exp(-ROLL_DRAG * dt)

      // screen edges and the top of the sky
      const b = st.bounds
      if (st.x < b.minX) {
        st.x = b.minX
        st.vx = Math.abs(st.vx) * WALL_BOUNCE
      } else if (st.x > b.maxX) {
        st.x = b.maxX
        st.vx = -Math.abs(st.vx) * WALL_BOUNCE
      }
      if (st.y < b.minY) {
        st.y = b.minY
        st.vy = Math.abs(st.vy) * 0.5
      }

      // rolling: the ball turns by distance / radius
      st.angle += ((st.vx * dt) / st.r) * (180 / Math.PI)
      render()

      if (st.y === 0 && st.vy === 0 && Math.abs(st.vx) < 3) {
        st.vx = 0
        st.raf = 0
        return
      }
    }
    st.raf = requestAnimationFrame(step)
  }

  const wake = () => {
    const st = sim.current
    measure()
    if (!st.raf) {
      st.last = performance.now()
      st.raf = requestAnimationFrame(step)
    }
  }

  useEffect(() => () => cancelAnimationFrame(sim.current.raf), [])

  const bind = useDrag(
    ({ first, last, tap, xy: [px, py], velocity: [vx, vy], direction: [dx, dy], memo }) => {
      const st = sim.current
      if (first) {
        measure()
        st.dragging = true
        memo = [px - st.x, py - st.y]
      }
      if (tap) {
        st.dragging = false
        st.vy = -820
        st.vx += (Math.random() - 0.5) * 300
        wake()
        return memo
      }
      if (!last) {
        const b = st.bounds
        const nx = Math.max(b.minX, Math.min(b.maxX, px - memo[0]))
        const ny = Math.max(b.minY, Math.min(0, py - memo[1]))
        st.angle += (nx - st.x) / st.r * (180 / Math.PI)
        st.x = nx
        st.y = ny
        render()
      } else {
        st.dragging = false
        const clamp = (v: number) => Math.max(-MAX_THROW, Math.min(MAX_THROW, v))
        st.vx = clamp(dx * vx * 1000)
        st.vy = clamp(dy * vy * 1000)
        wake()
      }
      return memo
    },
    { filterTaps: true, pointer: { capture: true } },
  )

  return (
    <div ref={anchor} className={cn('absolute', className)}>
      {/* shadow stays on the sand, shrinking as the ball goes up */}
      <div ref={shadow} className="absolute left-1/2 top-[88%] h-3 w-[80%] -translate-x-1/2 rounded-[50%] bg-[#a07d4c]/35 blur-[2px]" />
      {/* translate (physics) → squash (spring, always toward the sand) → spin (rolling) */}
      <div ref={ball} className="relative will-change-transform">
        <animated.div style={{ scaleX: sx, scaleY: sy, transformOrigin: '50% 100%' }}>
          <div ref={rotor} className="will-change-transform">
            <button type="button" aria-label="Beach ball" {...bind()} className="block touch-none cursor-grab active:cursor-grabbing">
              <BallArt />
            </button>
          </div>
        </animated.div>
      </div>
    </div>
  )
}

function BallArt() {
  return (
    <svg viewBox="-22 -22 44 44" className="w-[clamp(40px,10vw,60px)] drop-shadow-[0_4px_4px_rgba(120,80,40,0.3)]">
      <defs>
        <clipPath id="ball-clip">
          <circle r="20" />
        </clipPath>
      </defs>
      <g clipPath="url(#ball-clip)">
        <rect x="-22" y="-22" width="44" height="44" fill="#fff8ec" />
        {[
          [0, '#ff8a65'],
          [120, '#5cc8d7'],
          [240, '#ffd27a'],
        ].map(([a, c]) => (
          <path key={a} d="M0 0 C 9 -6 13 -15 10 -26 L -10 -26 C -13 -15 -9 -6 0 0 Z" fill={c as string} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r="20" fill="none" stroke="#e2c79b" strokeWidth="1" />
      <circle r="3.2" fill="#fff8ec" stroke="#e2c79b" strokeWidth="0.8" />
      <ellipse cx="-8" cy="-9" rx="5" ry="3" fill="#fff" opacity="0.6" transform="rotate(-35 -8 -9)" />
    </svg>
  )
}

export function Sandcastle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 96" className={cn('pointer-events-none overflow-visible drop-shadow-[0_5px_4px_rgba(120,80,40,0.25)]', className)} aria-hidden>
      {/* flag */}
      <line x1="55" y1="4" x2="55" y2="30" stroke="#8a5a2e" strokeWidth="2" />
      <path d="M56 5 L78 11 L56 18 Z" fill="#ff8a65" className="origin-left animate-[flag_1.4s_ease-in-out_infinite]" style={{ transformBox: 'fill-box' }} />
      {/* towers */}
      <path d="M8 46 h6 v-6 h6 v6 h6 v-6 h6 v6 h2 V92 H8 Z" fill="#e3bf7f" />
      <path d="M76 46 h2 v-6 h6 v6 h6 v-6 h6 v6 h6 V92 H76 Z" fill="#e3bf7f" />
      <path d="M38 30 h6 v-6 h6 v6 h10 v-6 h6 v6 h6 V92 H38 Z" fill="#ecca8c" />
      {/* wall + door */}
      <rect x="4" y="66" width="102" height="26" rx="3" fill="#dcb473" />
      <path d="M48 92 V76 a7 7 0 0 1 14 0 V92 Z" fill="#b48b55" />
      {/* windows + texture */}
      <rect x="18" y="54" width="6" height="8" rx="3" fill="#b48b55" />
      <rect x="86" y="54" width="6" height="8" rx="3" fill="#b48b55" />
      <rect x="52" y="44" width="6" height="9" rx="3" fill="#b48b55" />
      {[
        [14, 80],
        [30, 74],
        [72, 82],
        [92, 76],
        [44, 60],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.3" fill="#fff4dc" opacity="0.8" />
      ))}
      {/* a little shell on the wall */}
      <path d="M26 70 l-5 6 q5 -7 10 0 z" fill="#ffd2bb" />
    </svg>
  )
}

const tailA = 'M30 78 C 22 96, 40 110, 30 128 S 20 158, 32 176'
const tailB = 'M30 78 C 40 96, 20 110, 32 128 S 44 158, 28 176'

/** A kite dancing in the sky, its tail rippling (Motion path morph). */
export function Kite({ className, visible = true }: { className?: string; visible?: boolean }) {
  return (
    <motion.div
      className={cn('pointer-events-none absolute transition-opacity duration-[1600ms]', !visible && 'opacity-0', className)}
      animate={{ rotate: [-7, 6, -7], y: [0, -12, 0], x: [0, 6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <svg viewBox="0 0 60 180" className="w-[clamp(30px,7vw,48px)] overflow-visible">
        {/* string trailing off to the beach */}
        <path d="M30 78 Q -40 180 -140 320" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" fill="none" />
        <motion.path
          initial={{ d: tailA }}
          animate={{ d: [tailA, tailB, tailA] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          stroke="#0e3b5c"
          strokeWidth="1.5"
          fill="none"
        />
        {[
          [30, 104, '#ff8a65'],
          [30, 132, '#5cc8d7'],
          [30, 160, '#ffd27a'],
        ].map(([cx, cy, c], i) => (
          <motion.path
            key={i}
            d={`M${(cx as number) - 6} ${cy} L${cx} ${(cy as number) - 4} L${(cx as number) + 6} ${cy} L${cx} ${(cy as number) + 4} Z`}
            fill={c as string}
            animate={{ x: [0, i % 2 ? -5 : 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
        <path d="M30 0 L56 34 L30 78 Z" fill="#ff8a65" />
        <path d="M30 0 L4 34 L30 78 Z" fill="#5cc8d7" />
        <path d="M4 34 L56 34 L30 78 Z" fill="#1b8eb0" opacity="0.35" />
        <path d="M30 0 V78 M4 34 H56" stroke="#fff8ec" strokeWidth="1.5" />
      </svg>
    </motion.div>
  )
}

/** Every so often a sea turtle paddles across, half under the water. */
export function Turtle({ className, visible = true }: { className?: string; visible?: boolean }) {
  return (
    <div
      className={cn('pointer-events-none absolute left-0 animate-[swim_38s_linear_infinite] transition-opacity duration-[1600ms]', !visible && 'opacity-0', className)} style={{ animationDelay: '-6s' }} aria-hidden>
      <div className="relative animate-[bob_2.8s_ease-in-out_infinite]">
        <div className="h-[clamp(30px,7.5vw,48px)] overflow-hidden">
          <Sticker name="turtle" size="clamp(44px, 11vw, 70px)" />
        </div>
        <span className="absolute -inset-x-2 top-[calc(clamp(30px,7.5vw,48px)-3px)] h-1.5 rounded-[50%] bg-white/60 blur-[1px]" />
      </div>
    </div>
  )
}
