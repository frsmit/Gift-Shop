import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNav } from '@/lib/nav'

// Music starts muted. A small hint invites her to tap it until she does.
export function MusicToggle() {
  const { music, screen } = useNav()
  const [touched, setTouched] = useState(false)
  if (!music.available || screen === 'gate') return null

  const onClick = () => {
    setTouched(true)
    music.toggle()
  }

  return (
    <div className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-40 flex items-center gap-2">
      <AnimatePresence>
        {/* hint only on the landing page (no back button there to collide with) */}
        {!touched && !music.playing && screen === 'landing' && (
          <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.9, transition: { delay: 0 } }}
            transition={{ delay: 2.2, type: 'spring', stiffness: 220, damping: 18 }}
            className="relative whitespace-nowrap rounded-full bg-cream/90 px-3 py-1.5 font-hand text-base text-ocean shadow-md ring-1 ring-aqua/40 backdrop-blur"
          >
            tap for music 🎵
            <span className="absolute -right-1 top-1/2 size-2.5 -translate-y-1/2 rotate-45 bg-cream/90" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onClick}
        aria-label={music.playing ? 'Mute music' : 'Play music'}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.88 }}
        className="relative flex size-12 items-center justify-center rounded-full border border-white/60 bg-white/35 shadow-lg backdrop-blur-md"
      >
        {!touched && !music.playing && (
          <span className="absolute inset-0 animate-ping rounded-full bg-aqua/40" aria-hidden />
        )}
        {/* Spinning record */}
        <motion.span
          className="absolute inset-1.5 rounded-full bg-[repeating-radial-gradient(circle,#0e3b5c_0_2px,#16507a_2px_4px)]"
          animate={{ rotate: music.playing ? 360 : 0 }}
          transition={music.playing ? { duration: 3, ease: 'linear', repeat: Infinity } : { duration: 0.4 }}
        />
        <span className="relative size-3.5 rounded-full bg-coral ring-2 ring-cream" />
        <AnimatePresence>
          {!music.playing && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute h-[2px] w-9 rotate-45 rounded bg-cream shadow"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
