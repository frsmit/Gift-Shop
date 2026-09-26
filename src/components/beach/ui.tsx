import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import SplitText from '@/components/SplitText'
import { RippleButton, RippleButtonRipples } from '@/components/animate-ui/components/buttons/ripple'
import { useNav, type Screen } from '@/lib/nav'
import { lite } from '@/lib/perf'
import { cn } from '@/lib/utils'
import { placeholder } from '@/config'

/** Script heading that writes itself in (React Bits SplitText / GSAP) once the tide pulls back. */
export function ScriptTitle({
  text,
  className,
  tag = 'h1',
  delay = 45,
}: {
  text: string
  className?: string
  tag?: 'h1' | 'h2' | 'p'
  delay?: number
}) {
  const { revealed } = useNav()
  const cls = cn('font-script leading-[1.15] pb-[0.15em] px-[0.3em]', className)
  if (!revealed) {
    const Tag = tag
    return <Tag className={cn(cls, 'invisible')}>{text}</Tag>
  }
  return (
    <SplitText
      text={text}
      tag={tag}
      className={cls}
      delay={delay}
      duration={1.1}
      ease="back.out(1.6)"
      splitType="chars"
      // animating blur per letter is expensive on phones; they get the same motion without it
      from={lite ? { opacity: 0, y: 40, rotate: -8 } : { opacity: 0, y: 40, rotate: -8, filter: 'blur(6px)' }}
      to={lite ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)' }}
      threshold={0}
      rootMargin="0px"
    />
  )
}

/** Soft fade-up for blocks of content, staggered by `i`. */
export function Reveal({
  children,
  i = 0,
  className,
  base = 0.35,
}: {
  children: ReactNode
  i?: number
  className?: string
  base?: number
}) {
  const { revealed } = useNav()
  return (
    <motion.div
      className={className}
      initial={lite ? { opacity: 0, y: 28 } : { opacity: 0, y: 28, filter: 'blur(8px)' }}
      animate={revealed ? (lite ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: 'blur(0px)' }) : undefined}
      transition={{ duration: 0.9, delay: base + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Animate UI ripple button, dressed for the beach. */
export function OceanButton({
  children,
  onClick,
  className,
  variant = 'ocean',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'ocean' | 'cream'
}) {
  return (
    <RippleButton
      onClick={onClick}
      className={cn(
        'h-auto rounded-full px-7 py-3.5 font-hand text-xl tracking-wide shadow-[0_10px_30px_-8px_rgba(14,59,92,0.55)] sm:text-2xl',
        variant === 'ocean'
          ? 'bg-ocean text-cream hover:bg-ocean/90 [--ripple-button-ripple-color:#5cc8d7]'
          : 'bg-cream text-ocean hover:bg-cream/90 [--ripple-button-ripple-color:#5cc8d7]',
        className,
      )}
    >
      {children}
      <RippleButtonRipples />
    </RippleButton>
  )
}

export function BackButton({ to = 'bottles', label = 'back to the shore', light = false }: { to?: Screen; label?: string; light?: boolean }) {
  const { go } = useNav()
  return (
    <motion.button
      type="button"
      onClick={() => go(to)}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 font-hand text-lg tracking-wide backdrop-blur-sm sm:text-xl',
        light ? 'bg-white/15 text-cream ring-1 ring-white/40' : 'bg-white/45 text-ocean ring-1 ring-white/70',
      )}
    >
      <span aria-hidden>‹‹</span> {label}
    </motion.button>
  )
}

export function Polaroid({
  src,
  caption,
  className,
  tape = true,
  imgClassName,
  index = 0,
}: {
  src: string
  caption?: ReactNode
  className?: string
  tape?: boolean
  imgClassName?: string
  /** which photo this is, for the placeholder shown if the link fails */
  index?: number
}) {
  return (
    <figure className={cn('polaroid relative', className)}>
      {tape && <span className="tape" aria-hidden />}
      <PhotoImg src={src} index={index} className={cn('aspect-square w-full select-none object-cover', imgClassName)} />
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-1.5 text-center font-marker text-lg text-ocean sm:bottom-2.5 sm:text-xl">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/** Each screen scrolls on its own; content is centred and padded for notches. */
export function ScreenShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** An <img> for photo links: no referrer (Google's image host can refuse hotlinks with one)
 *  and a friendly placeholder instead of a broken image if the link fails. */
export function PhotoImg({ src, index = 0, className }: { src: string; index?: number; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      referrerPolicy="no-referrer"
      decoding="async"
      className={className}
      onError={(e) => {
        const img = e.currentTarget
        img.onerror = null
        img.src = placeholder(index)
      }}
    />
  )
}
