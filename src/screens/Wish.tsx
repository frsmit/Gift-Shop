import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SparklesText } from '@/components/ui/sparkles-text'
import { Cake } from '@/components/beach/Cake'
import { Floaty } from '@/components/beach/Floaty'
import { Sticker } from '@/components/beach/Sticker'
import { BackButton, OceanButton, PhotoImg, Reveal, ScreenShell, ScriptTitle } from '@/components/beach/ui'
import { cannons } from '@/lib/celebrate'
import { useNav } from '@/lib/nav'
import { config, photo } from '@/config'

export default function Wish() {
  const { go, resetOpened, revealed } = useNav()
  const [blown, setBlown] = useState(false)

  const onBlown = () => {
    setBlown(true)
    cannons()
  }

  const restart = () => {
    resetOpened()
    go('landing')
  }

  return (
    <ScreenShell className="gap-4">
      <div className="w-full self-start text-left">
        <BackButton light />
      </div>

      <Floaty className="left-[5%] top-[16%]" delay={600}>
        <Sticker name="balloon" size="clamp(46px, 10vw, 80px)" />
      </Floaty>
      <Floaty className="right-[5%] top-[40%] hidden md:block" delay={900} amp={14}>
        <Sticker name="gift" size={80} />
      </Floaty>

      <div className="grid w-full max-w-5xl flex-1 items-center gap-8 md:grid-cols-2 md:gap-10">
        {/* Cake side */}
        <div className="flex flex-col items-center gap-3 text-center">
          <ScriptTitle text={config.finalTitle} tag="h2" className="text-[clamp(2.6rem,10vw,5rem)] text-cream glow-shadow-text" />
          <Reveal i={1}>
            <Cake onBlown={onBlown} />
          </Reveal>
          <AnimatePresence mode="wait">
            {blown ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                <SparklesText
                  className="font-script text-[clamp(2.4rem,9vw,4.2rem)] font-normal text-cream glow-shadow-text"
                  colors={{ first: '#ffd27a', second: '#dff6f5' }}
                  sparklesCount={10}
                >
                  Happy Birthday!
                </SparklesText>
              </motion.div>
            ) : (
              revealed && (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 1.2 }}
                  className="font-hand text-xl text-cream sm:text-2xl"
                >
                  close your eyes, make a wish & tap the cake 🕯️
                </motion.p>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Scalloped postcard with the final note */}
        <Reveal i={2} className="relative mx-auto w-full max-w-lg">
          <motion.div
            initial={{ rotate: 4 }}
            animate={revealed ? { rotate: -1.5 } : undefined}
            transition={{ type: 'spring', stiffness: 70, damping: 10, delay: 0.5 }}
            className="scalloped"
          >
            <div className="flex items-start gap-4">
              <PhotoImg src={photo(0)} className="hidden size-20 shrink-0 rotate-3 rounded-sm object-cover shadow-md ring-4 ring-white sm:block" />
              <div className="space-y-3 text-center sm:text-left">
                {config.finalMessage.map((p, i) => (
                  <p key={i} className="font-hand text-[clamp(1.1rem,4vw,1.4rem)] leading-relaxed tracking-wide text-ocean">
                    {p}
                  </p>
                ))}
                <p className="pt-1 text-right font-script text-[clamp(1.6rem,5.5vw,2.3rem)] leading-tight text-sunset">{config.signature}</p>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>

      <AnimatePresence>
        {blown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="flex flex-col items-center gap-2"
          >
            <OceanButton variant="cream" onClick={restart}>
              ‹ Restart the day ›
            </OceanButton>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  )
}
