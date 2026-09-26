import { useEffect, useRef, useState } from 'react'
import { motion, useAnimate } from 'motion/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number'
import { Input } from '@/components/ui/input'
import { Bottle } from '@/components/beach/Bottle'
import { Floaty } from '@/components/beach/Floaty'
import { Sticker } from '@/components/beach/Sticker'
import { OceanButton, Reveal, ScreenShell, ScriptTitle } from '@/components/beach/ui'
import { burst } from '@/lib/celebrate'
import { useNav } from '@/lib/nav'
import { config } from '@/config'

const skipCountdown = () => new URLSearchParams(window.location.search).has('preview')

const remaining = () => Math.max(0, config.birthdayAt.getTime() - Date.now())

export default function Gate() {
  const { go } = useNav()
  const [msLeft, setMsLeft] = useState(() => (config.countdown && !skipCountdown() ? remaining() : 0))
  const locked = msLeft > 0

  useEffect(() => {
    if (!locked) return
    const id = setInterval(() => {
      const left = remaining()
      setMsLeft(left)
      if (left === 0) burst()
    }, 1000)
    return () => clearInterval(id)
  }, [locked])

  return (
    <ScreenShell className="justify-center gap-8 text-center">
      <Floaty className="left-[6%] top-[12%]" delay={300}>
        <Sticker name="sparkles" size="clamp(40px, 9vw, 64px)" eager />
      </Floaty>
      <Floaty className="right-[8%] top-[30%]" delay={500} amp={14}>
        <Sticker name="bubbles" size="clamp(44px, 10vw, 72px)" eager />
      </Floaty>

      {locked ? <Countdown msLeft={msLeft} /> : config.passcode ? <Passcode onUnlock={() => go('landing')} /> : <Ready onGo={() => go('landing')} />}
    </ScreenShell>
  )
}

function Countdown({ msLeft }: { msLeft: number }) {
  const s = Math.floor(msLeft / 1000)
  const parts = [
    { label: 'days', value: Math.floor(s / 86400) },
    { label: 'hours', value: Math.floor((s % 86400) / 3600) },
    { label: 'mins', value: Math.floor((s % 3600) / 60) },
    { label: 'secs', value: s % 60 },
  ]

  return (
    <>
      <BottleOnWaves />
      <ScriptTitle text="Something's washing ashore..." className="text-cream glow-shadow-text text-5xl sm:text-7xl" />
      <Reveal i={1}>
        <p className="font-hand text-xl text-cream/90 sm:text-2xl">A little surprise for {config.name} arrives at midnight 🌙</p>
      </Reveal>
      <Reveal i={2} className="grid w-full max-w-md grid-cols-4 gap-2 sm:gap-4">
        {parts.map((p) => (
          <div key={p.label} className="rounded-2xl bg-white/15 px-1 py-3 ring-1 ring-white/30 backdrop-blur-md sm:py-4">
            <SlidingNumber
              number={p.value}
              padStart
              className="flex justify-center font-marker text-3xl text-cream sm:text-5xl"
            />
            <div className="mt-1 font-hand text-sm uppercase tracking-widest text-cream/80">{p.label}</div>
          </div>
        ))}
      </Reveal>
    </>
  )
}

function BottleOnWaves() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      gsap.to('.gate-bottle', { y: -12, rotate: 8, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="flex justify-center">
      <div className="gate-bottle">
        <Bottle label="arriving at midnight 🌙" disabled />
      </div>
    </div>
  )
}

function Passcode({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  const [scope, animate] = useAnimate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim().toLowerCase() === config.passcode.toLowerCase()) {
      burst()
      onUnlock()
    } else {
      setWrong(true)
      animate(scope.current, { x: [0, -14, 12, -8, 6, 0] }, { duration: 0.45 })
    }
  }

  return (
    <>
      <Floaty className="left-1/2 top-[8%] -translate-x-1/2" draggable={false}>
        <Sticker name="crystal" size="clamp(56px, 13vw, 88px)" eager />
      </Floaty>
      <ScriptTitle text="Hey you!" className="text-cream glow-shadow-text text-6xl sm:text-8xl" />
      <Reveal i={1}>
        <p className="font-hand text-xl text-cream/90 sm:text-2xl">Enter the secret code to open your surprise 🐚</p>
      </Reveal>
      <Reveal i={2} className="w-full max-w-xs">
        <form ref={scope} onSubmit={submit} className="flex flex-col items-center gap-4">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setWrong(false)
            }}
            inputMode="text"
            autoComplete="off"
            placeholder="secret code"
            aria-label="Secret code"
            className="h-14 rounded-full border-white/50 bg-white/80 text-center font-hand text-2xl tracking-[0.3em] text-ocean placeholder:tracking-normal placeholder:text-ocean/40"
          />
          {wrong && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="font-hand text-lg text-peach">
              Not quite! {config.passcodeHint}
            </motion.p>
          )}
          {!wrong && config.passcodeHint && <p className="font-hand text-base text-cream/70">{config.passcodeHint}</p>}
          <OceanButton variant="cream">Unlock 🔓</OceanButton>
        </form>
      </Reveal>
    </>
  )
}

function Ready({ onGo }: { onGo: () => void }) {
  return (
    <>
      <Floaty className="left-1/2 top-[10%] -translate-x-1/2" draggable={false}>
        <Sticker name="gift" size="clamp(64px, 15vw, 100px)" eager />
      </Floaty>
      <ScriptTitle text="It's here!" className="text-cream glow-shadow-text text-6xl sm:text-8xl" />
      <Reveal i={1}>
        <OceanButton variant="cream" onClick={onGo}>
          Open your surprise ✨
        </OceanButton>
      </Reveal>
    </>
  )
}
