import { motion } from 'motion/react'
import { TextAnimate } from '@/components/ui/text-animate'
import { Floaty } from '@/components/beach/Floaty'
import { Sticker } from '@/components/beach/Sticker'
import { BackButton, Polaroid, Reveal, ScreenShell, ScriptTitle } from '@/components/beach/ui'
import { useNav } from '@/lib/nav'
import { config, photo, photoCaption } from '@/config'

export default function Letter() {
  const { revealed } = useNav()

  return (
    <ScreenShell className="gap-4">
      <div className="w-full self-start text-left">
        <BackButton />
      </div>

      <div className="grid w-full max-w-5xl flex-1 items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
        {/* Photo */}
        <Reveal i={0} className="relative mx-auto w-[min(62vw,320px)] md:w-full md:max-w-[360px]">
          <motion.div
            initial={{ rotate: 8, y: 40 }}
            animate={revealed ? { rotate: -3, y: 0 } : undefined}
            transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.3 }}
          >
            <Polaroid src={photo(1)} index={1} caption={photoCaption(1, 'sun-kissed & iconic')} />
          </motion.div>
          <Floaty className="-right-6 -top-8" delay={900}>
            <Sticker name="sunface" size="clamp(48px, 11vw, 72px)" />
          </Floaty>
          <Floaty className="-bottom-8 -right-5" delay={1100} amp={8}>
            <Sticker name="icecream" size="clamp(48px, 11vw, 72px)" />
          </Floaty>
        </Reveal>

        {/* Letter on cream paper */}
        <Reveal i={1} className="relative">
          <div className="paper-lines relative rounded-[1.25rem] bg-cream/95 px-5 py-6 shadow-[0_24px_60px_-20px_rgba(14,59,92,0.55)] ring-1 ring-[#ecdcbc] sm:px-9 sm:py-8">
            <ScriptTitle text={config.letterTitle} tag="h2" className="text-left text-[clamp(2.4rem,9vw,4rem)] text-sea" />
            <div className="mt-2 space-y-4">
              {revealed &&
                config.letter.map((para, i) => (
                  <TextAnimate
                    key={i}
                    as="p"
                    by="word"
                    animation="blurInUp"
                    delay={0.8 + i * 0.5}
                    duration={para.split(" ").length * 0.04}
                    once
                    className="font-hand text-[clamp(1.15rem,4.2vw,1.45rem)] leading-[2.1rem] tracking-wide text-ocean"
                  >
                    {para}
                  </TextAnimate>
                ))}
            </div>
            <Reveal i={0} base={1.4 + config.letter.length * 0.6}>
              <p className="mt-6 text-right font-script text-[clamp(1.8rem,6vw,2.6rem)] leading-tight text-sea">
                {config.signature}
              </p>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </ScreenShell>
  )
}
