import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import BlurText from '@/components/BlurText'
import { SparklesText } from '@/components/ui/sparkles-text'
import { WavyBackground } from '@/components/ui/wavy-background'
import { Floaty } from '@/components/beach/Floaty'
import { Sticker } from '@/components/beach/Sticker'
import { OceanButton, Reveal, ScreenShell, ScriptTitle } from '@/components/beach/ui'
import { burst } from '@/lib/celebrate'
import { lite } from '@/lib/perf'
import { useNav } from '@/lib/nav'
import { config } from '@/config'

export default function Landing() {
  const { go, revealed } = useNav()
  const crab = useRef<HTMLDivElement>(null)

  // GSAP: a little crab scuttles back and forth along the shore.
  useGSAP(
    () => {
      if (!crab.current) return
      gsap
        .timeline({ repeat: -1, repeatDelay: 1.2 })
        .to(crab.current, { x: '46vw', duration: 5, ease: 'sine.inOut' })
        .to(crab.current, { scaleX: -1, duration: 0.2 })
        .to(crab.current, { x: 0, duration: 5, ease: 'sine.inOut' }, '+=0.8')
        .to(crab.current, { scaleX: 1, duration: 0.2 })
      gsap.to(crab.current, { y: -4, duration: 0.18, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    },
    { dependencies: [] },
  )

  const start = () => {
    burst({ x: 0.5, y: 0.7 })
    setTimeout(() => go('bottles'), 450)
  }

  return (
    <>
      {/* Aceternity waves as a soft glowing current behind the title */}
      <div className="pointer-events-none fixed inset-0">
        <WavyBackground
          containerClassName="h-full"
          backgroundFill="transparent"
          colors={['#ffffff', '#dff6f5', '#5cc8d7', '#fff1dc', '#9fe0ea']}
          waveOpacity={0.35}
          waveWidth={40}
          blur={12}
          speed="slow"
          waveY={0.62}
          waveCount={4}
          lowPower={lite}
        />
      </div>

      <ScreenShell className="justify-center text-center">
        <Floaty className="left-[4%] top-[9%] sm:left-[10%]" delay={200}>
          <Sticker name="sunface" size="clamp(52px, 12vw, 96px)" eager />
        </Floaty>
        <Floaty className="right-[20%] top-[5%] hidden sm:block" delay={350} amp={16}>
          <Sticker name="balloon" size="clamp(52px, 10vw, 90px)" eager />
        </Floaty>
        <Floaty className="right-[5%] top-[17%] sm:right-[10%]" delay={500}>
          <Sticker name="partyface" size="clamp(52px, 12vw, 92px)" eager />
        </Floaty>
        <Floaty className="bottom-[20%] left-[6%] sm:left-[14%]" delay={700} amp={8}>
          <Sticker name="drink" size="clamp(48px, 11vw, 84px)" eager />
        </Floaty>
        <Floaty className="bottom-[24%] right-[6%] sm:right-[14%]" delay={850} amp={12}>
          <Sticker name="dolphin" size="clamp(52px, 12vw, 96px)" eager />
        </Floaty>

        <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
          <ScriptTitle text="Happy Birthday" className="text-[clamp(3.4rem,15vw,9rem)] text-ocean drop-shadow-[0_2px_0_rgba(255,248,236,0.9)]" />
          <Reveal i={3} base={0.6}>
            <SparklesText
              className="font-script text-[clamp(3.8rem,17vw,8.5rem)] font-normal leading-tight text-sea"
              colors={{ first: '#5cc8d7', second: '#ffc49b' }}
              sparklesCount={lite ? 5 : 8}
            >
              {config.name}
            </SparklesText>
          </Reveal>

          {revealed && (
            <BlurText
              text={config.tagline}
              delay={90}
              animateBy="words"
              direction="bottom"
              {...(lite ? { animationFrom: { opacity: 0, y: 30 }, animationTo: [{ opacity: 1, y: 0 }] } : {})}
              className="mt-2 max-w-xl justify-center px-2 font-hand text-[clamp(1.25rem,4.8vw,1.9rem)] tracking-wide text-ocean/90"
            />
          )}

          <Reveal i={6} base={1.4} className="mt-6 sm:mt-8">
            <OceanButton onClick={start}>Let's dive in 🌊</OceanButton>
          </Reveal>
        </div>
      </ScreenShell>

      {/* crab on the sand line */}
      <div ref={crab} className="pointer-events-none fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[8%] z-10">
        <Sticker name="crab" size="clamp(44px, 10vw, 70px)" eager />
      </div>
    </>
  )
}
