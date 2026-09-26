import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Sticker } from '../Sticker'

const DROPS = 7

// Open water between the bottles (x%, waterline y% of the sea area), so jumps stay visible.
const MOBILE_SPOTS = [[50, 52], [50, 96], [86, 44], [14, 48], [52, 26]]
const DESKTOP_SPOTS = [[27, 74], [50, 52], [73, 86], [94, 72], [8, 80], [50, 94]]

// Every few seconds a dolphin leaps out of the sea somewhere random, with a splash on
// the way out and on the way back in. The part below the waterline is clipped away.
export function Dolphins({ active = true }: { active?: boolean }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      let timer: ReturnType<typeof setTimeout>
      let alive = true

      // Scoped selector so timer callbacks only touch this component's elements
      const q = gsap.utils.selector(root)

      const splash = (cls: string, x: number) => {
        gsap.set(q(cls), { x })
        q(`${cls} .drop`).forEach((drop) => {
          const dx = gsap.utils.random(-34, 34)
          gsap
            .timeline()
            .set(drop, { x: 0, y: 0, opacity: 1, scale: 1 })
            .to(drop, { x: dx * 0.6, y: gsap.utils.random(-48, -22), duration: 0.35, ease: 'power2.out' })
            .to(drop, { x: dx, y: 8, opacity: 0, scale: 0.5, duration: 0.45, ease: 'power2.in' })
        })
        gsap.fromTo(q(`${cls} .ring`), { scale: 0.3, opacity: 0.9 }, { scale: 1.6, opacity: 0, duration: 1.1, ease: 'power2.out' })
      }

      const jump = () => {
        const dir = Math.random() < 0.5 ? 1 : -1 // 1 = swims left (emoji faces left)
        const body = q('.d-body')
        const spots = window.innerWidth >= 768 ? DESKTOP_SPOTS : MOBILE_SPOTS
        const [x, y] = spots[Math.floor(Math.random() * spots.length)]
        gsap.set(q('.d-anchor'), { left: `${x}%`, top: `${y}%` })
        gsap.set(q('.d-flip'), { scaleX: dir })

        // only visible (so its animated image only plays) while it's actually jumping
        gsap
          .timeline({
            onStart: () => void gsap.set(body, { visibility: 'visible' }),
            onComplete: () => {
              gsap.set(body, { visibility: 'hidden' })
              if (alive) timer = setTimeout(jump, gsap.utils.random(3000, 7000))
            },
          })
          .call(() => splash('.d-splash-a', 40 * dir))
          .fromTo(body, { x: 40 * dir, rotate: 12 * dir }, { x: -40 * dir, rotate: -70 * dir, duration: 1.6, ease: 'none' }, 0)
          .fromTo(body, { yPercent: 110, y: 0 }, { yPercent: 0, y: -120, duration: 0.8, ease: 'power2.out' }, 0)
          .to(body, { yPercent: 110, y: 0, duration: 0.8, ease: 'power2.in' }, 0.8)
          .call(() => splash('.d-splash-b', -40 * dir), [], 1.5)
          .to({}, { duration: 0.8 })
      }

      timer = setTimeout(jump, 1800)
      return () => {
        alive = false
        clearTimeout(timer)
      }
    },
    { scope: root, dependencies: [active], revertOnUpdate: true },
  )

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      <div className="d-anchor absolute h-0 w-0" style={{ left: '50%', top: '50%' }}>
        {/* clip box: its bottom edge is the waterline */}
        <div className="absolute bottom-0 left-1/2 h-[260px] w-[220px] -translate-x-1/2 overflow-hidden">
          <div className="d-body absolute bottom-0 left-1/2 -ml-[clamp(33px,8.5vw,55px)]" style={{ transform: 'translateY(110%)', visibility: 'hidden' }}>
            <div className="d-flip">
              <Sticker name="dolphin" size="clamp(66px, 17vw, 110px)" />
            </div>
          </div>
        </div>
        {['d-splash-a', 'd-splash-b'].map((cls) => (
          <div key={cls} className={`${cls} absolute left-0 top-0`}>
            <span className="ring absolute -left-8 -top-2 h-4 w-16 rounded-[50%] border-2 border-white/80 opacity-0" />
            {Array.from({ length: DROPS }, (_, i) => (
              <span key={i} className="drop absolute -left-1 -top-1 size-2 rounded-full bg-white/90 opacity-0" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
