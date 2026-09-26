import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { shells as confettiShells } from '@/lib/celebrate'
import { cn } from '@/lib/utils'
import { config } from '@/config'
import type { BeachMode } from '@/lib/nav'

type Spot = { left: string; top: string; kind: 'scallop' | 'star' | 'conch'; color: string; rot: number }

// Positions are % of the sand area.
const spots: Spot[] = [
  { left: '36%', top: '86%', kind: 'scallop', color: '#ffd2bb', rot: -14 },
  { left: '52%', top: '90%', kind: 'star', color: '#ff9a6b', rot: 12 },
  { left: '64%', top: '72%', kind: 'conch', color: '#fbe7d0', rot: -24 },
  { left: '78%', top: '82%', kind: 'scallop', color: '#e9d8f4', rot: 18 },
  { left: '90%', top: '60%', kind: 'star', color: '#ffc49b', rot: -8 },
]

export function Shells({ mode = 'day' }: { mode?: BeachMode }) {
  const notes = config.shellNotes
  const [open, setOpen] = useState<number | null>(null)
  const [found, setFound] = useState<Set<number>>(() => new Set())
  const count = Math.min(notes.length, spots.length)
  const allFound = count > 0 && found.size === count

  useEffect(() => {
    if (!allFound) return
    const t = setTimeout(confettiShells, 250)
    return () => clearTimeout(t)
  }, [allFound])

  if (!count) return null

  const tap = (i: number) => {
    setOpen(open === i ? null : i)
    setFound((prev) => new Set(prev).add(i))
  }

  return (
    <>
      {open !== null && <button type="button" aria-label="Close note" className="pointer-events-auto fixed inset-0 z-30 cursor-default" onClick={() => setOpen(null)} />}

      {spots.slice(0, count).map((s, i) => {
        const x = parseFloat(s.left)
        return (
          <div key={i} className={cn('pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2', open === i ? 'z-40' : 'z-20')} style={{ left: s.left, top: s.top }}>
            <motion.button
              type="button"
              onClick={() => tap(i)}
              aria-label="Open a seashell"
              whileTap={{ scale: 0.85 }}
              animate={found.has(i) ? { rotate: s.rot } : { rotate: [s.rot, s.rot + 8, s.rot - 6, s.rot] }}
              transition={found.has(i) ? { duration: 0.3 } : { duration: 1.2, repeat: Infinity, repeatDelay: 2.5 + i * 0.7 }}
              className="relative block p-2"
            >
              {!found.has(i) && (
                <span className="absolute right-0 top-0 size-2 animate-ping rounded-full bg-white" aria-hidden />
              )}
              <span className={cn('block transition-[filter] duration-[1600ms]', mode === 'night' ? 'brightness-[0.6] saturate-50' : mode === 'evening' && 'sepia-[0.3]')}>
                <ShellShape kind={s.kind} color={s.color} dim={found.has(i)} />
              </span>
            </motion.button>

            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className={cn(
                    'absolute bottom-full mb-1 w-[min(62vw,240px)] rounded-2xl bg-cream px-4 py-3 text-center shadow-xl ring-1 ring-[#e2c79b]',
                    x < 30 ? 'left-0 origin-bottom-left' : x > 70 ? 'right-0 origin-bottom-right' : 'left-1/2 -translate-x-1/2 origin-bottom',
                  )}
                >
                  <p className="font-hand text-lg leading-snug text-ocean">{notes[i]}</p>
                  <p className="mt-1 font-hand text-sm text-sea/80">
                    shell {found.size} of {count} found {found.size === count ? '✨' : '🐚'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      <AnimatePresence>
        {found.size === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 3 }}
            className={cn(
              'pointer-events-none absolute left-[46%] top-[62%] -translate-x-1/2 whitespace-nowrap font-hand text-base sm:text-lg',
              mode === 'night' ? 'text-cream/80' : 'text-[#9a7446]',
            )}
          >
            psst... tap the shells ✨
          </motion.p>
        )}
      </AnimatePresence>
    </>
  )
}

function ShellShape({ kind, color, dim }: { kind: Spot['kind']; color: string; dim: boolean }) {
  const cls = cn('w-[clamp(30px,8vw,46px)] drop-shadow-[0_3px_3px_rgba(120,80,40,0.35)] transition-opacity', dim && 'opacity-70')
  if (kind === 'star')
    return (
      <svg viewBox="0 0 40 40" className={cls}>
        <path
          d="M20 2 C22 10 24 13 32 13 C26 18 25 21 28 30 C22 25 18 25 12 30 C15 21 14 18 8 13 C16 13 18 10 20 2 Z"
          fill={color}
          stroke="#d9774a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {[
          [20, 10],
          [26, 16],
          [23, 23],
          [17, 23],
          [14, 16],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.2" fill="#fff4dc" />
        ))}
      </svg>
    )
  if (kind === 'conch')
    return (
      <svg viewBox="0 0 40 40" className={cls}>
        <path d="M8 30 C 4 18, 14 6, 28 6 C 36 10, 36 20, 28 26 C 22 30, 14 34, 8 30 Z" fill={color} stroke="#d6a77f" strokeWidth="1.5" />
        <path d="M14 26 C 16 18, 22 12, 30 12 M12 20 C 16 14, 22 10, 28 9" stroke="#d6a77f" strokeWidth="1.3" fill="none" />
        <path d="M26 24 C 30 22, 32 18, 30 14" stroke="#f0b99a" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 40 38" className={cls}>
      <path d="M20 34 L4 15 Q 20 -6 36 15 Z" fill={color} stroke="#d99f84" strokeWidth="1.5" strokeLinejoin="round" />
      {[8, 13, 20, 27, 32].map((x, i) => (
        <path key={i} d={`M20 33 L${x} ${i === 2 ? 4 : i === 1 || i === 3 ? 6 : 11}`} stroke="#d99f84" strokeWidth="1.2" />
      ))}
      <path d="M15 34 H25 L23 37 H17 Z" fill="#d99f84" />
    </svg>
  )
}
