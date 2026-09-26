import type { CSSProperties, ReactNode } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { cn } from '@/lib/utils'

// Physics-y float: pops in, bobs like it's on water, and can be flung around
// (it springs back home when released).
export function Floaty({
  children,
  className,
  style,
  delay = 0,
  amp = 10,
  tilt = 6,
  draggable = true,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
  amp?: number
  tilt?: number
  draggable?: boolean
}) {
  const pop = useSpring({
    from: { scale: 0, rotate: -30 },
    to: { scale: 1, rotate: 0 },
    delay,
    config: { tension: 220, friction: 12 },
  })

  const bob = useSpring({
    from: { y: 0, r: -tilt },
    to: { y: -amp, r: tilt },
    loop: { reverse: true },
    delay: delay + 200,
    config: { mass: 4, tension: 30, friction: 14 },
  })

  const [drag, api] = useSpring(() => ({ x: 0, y: 0, scale: 1 }))
  const bind = useDrag(
    ({ down, movement: [mx, my] }) => {
      api.start({
        x: down ? mx : 0,
        y: down ? my : 0,
        scale: down ? 1.15 : 1,
        config: down ? { tension: 800, friction: 40 } : { tension: 180, friction: 9 },
      })
    },
    { filterTaps: true },
  )

  return (
    <animated.div
      {...(draggable ? bind() : {})}
      className={cn('absolute touch-none', draggable ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none', className)}
      style={{ ...style, x: drag.x, y: drag.y, scale: drag.scale }}
    >
      <animated.div style={{ scale: pop.scale, rotate: pop.rotate }}>
        <animated.div style={{ y: bob.y, rotate: bob.r }}>{children}</animated.div>
      </animated.div>
    </animated.div>
  )
}
