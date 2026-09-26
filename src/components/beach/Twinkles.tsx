import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

/**
 * Many twinkling dots (stars, plankton, sea glints) for the price of a few animations:
 * the dots are static and split across `layers` groups, and each group fades in and out.
 */
export function Twinkles({
  count,
  place,
  dotClassName,
  layers = 3,
  duration = 3,
  className,
}: {
  count: number
  /** position / size of dot i */
  place: (i: number) => CSSProperties
  dotClassName: string
  layers?: number
  duration?: number
  className?: string
}) {
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden>
      {Array.from({ length: layers }, (_, layer) => (
        <div
          key={layer}
          className="absolute inset-0 animate-[twinkle_3s_ease-in-out_infinite]"
          style={{ animationDuration: `${duration}s`, animationDelay: `${(layer * duration) / layers}s` }}
        >
          {Array.from({ length: count }, (_, i) => i)
            .filter((i) => i % layers === layer)
            .map((i) => (
              <span key={i} className={cn('absolute rounded-full', dotClassName)} style={place(i)} />
            ))}
        </div>
      ))}
    </div>
  )
}
