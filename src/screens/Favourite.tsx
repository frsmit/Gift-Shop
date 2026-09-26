import { motion } from 'motion/react'
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { Floaty } from '@/components/beach/Floaty'
import { Sticker } from '@/components/beach/Sticker'
import { BackButton, Polaroid, Reveal, ScreenShell } from '@/components/beach/ui'
import { useNav } from '@/lib/nav'
import { config, photo, photoCaption } from '@/config'

const TYPE_MS = 55

export default function Favourite() {
  const { revealed } = useNav()

  // Each bubble starts typing after the previous one finishes.
  let at = 1400
  const bubbles = config.chatMessages.map((text) => {
    const delay = at
    at += text.length * TYPE_MS + 700
    return { text, delay }
  })

  return (
    <ScreenShell className="gap-2">
      <div className="w-full self-start text-left">
        <BackButton />
      </div>

      <Floaty className="left-[4%] top-[22%] hidden md:block" delay={500}>
        <Sticker name="hug" size={84} />
      </Floaty>
      <Floaty className="right-[6%] bottom-[10%]" delay={800} amp={14}>
        <Sticker name="jellyfish" size="clamp(52px, 12vw, 90px)" />
      </Floaty>

      {/* Torn-paper title label */}
      <Reveal i={0} base={0.15}>
        <motion.div
          initial={{ rotate: -12, scale: 0.6 }}
          animate={revealed ? { rotate: -4, scale: 1 } : undefined}
          transition={{ type: 'spring', stiffness: 160, damping: 10, delay: 0.2 }}
          className="relative mt-2 bg-[#f6ecd9] px-6 py-2 shadow-lg [clip-path:polygon(2%_8%,12%_0,30%_6%,48%_0,66%_7%,84%_1%,98%_6%,100%_50%,97%_94%,80%_100%,62%_93%,44%_100%,26%_94%,10%_100%,0_92%,3%_50%)]"
        >
          <h2 className="font-marker text-[clamp(2rem,8vw,3.4rem)] leading-none text-ocean">{config.favTitle}</h2>
        </motion.div>
      </Reveal>

      <div className="relative flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6 md:flex-row md:gap-4">
        {/* Collage */}
        <Reveal i={1} className="relative">
          {/* letter scrap peeking out behind */}
          <div className="paper-lines absolute -right-10 top-10 hidden h-[80%] w-40 rotate-6 rounded-sm bg-[#fbf3e3] shadow-md sm:block" aria-hidden />
          {/* postage stamp */}
          <div
            className="absolute -left-4 -top-3 z-20 size-16 rotate-[-10deg] bg-cream p-1.5 shadow-md outline-2 outline-dashed outline-offset-[-3px] outline-[#e2c79b] sm:-left-10 sm:size-20"
            aria-hidden
          >
            <div className="flex size-full items-end justify-center overflow-hidden bg-[linear-gradient(180deg,#79c4ea,#fff2de)]"><Sticker name="wave" size="80%" /></div>
          </div>

          <CardContainer containerClassName="py-0">
            <CardBody className="h-auto w-[min(78vw,340px)]">
              <CardItem translateZ={60} rotateZ={-2} className="w-full">
                <Polaroid src={photo(0)} index={0} caption={photoCaption(0, 'my person ☀️')} className="-rotate-2" />
              </CardItem>
              <CardItem translateZ={100} className="absolute -bottom-6 -right-6">
                <Sticker name="cool" size="clamp(54px, 13vw, 76px)" />
              </CardItem>
            </CardBody>
          </CardContainer>
        </Reveal>

        {/* Chat bubbles */}
        <div className="flex w-full max-w-xs flex-col items-end gap-2 md:mt-[-8rem] md:max-w-sm">
          {revealed &&
            bubbles.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.6, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: b.delay / 1000 - 0.3 }}
                className="origin-bottom-right rounded-[1.4rem] rounded-br-md bg-[linear-gradient(180deg,#2e9ae6,#1f7fd1)] px-4 py-2.5 text-left text-[clamp(1rem,4vw,1.25rem)] font-medium text-white shadow-lg"
              >
                <TypingAnimation delay={b.delay} duration={TYPE_MS} showCursor={false} className="leading-snug tracking-normal">
                  {b.text}
                </TypingAnimation>
              </motion.div>
            ))}
          {revealed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: at / 1000 }}
              className="pr-1 text-xs font-medium text-ocean/70"
            >
              Delivered ✓
            </motion.span>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}
