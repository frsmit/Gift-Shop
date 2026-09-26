import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { animated, useSprings } from '@react-spring/web'
import { TextAnimate } from '@/components/ui/text-animate'
import { Bottle } from '@/components/beach/Bottle'
import { Sticker } from '@/components/beach/Sticker'
import { BackButton, Reveal, ScriptTitle } from '@/components/beach/ui'
import { BeachSky } from '@/components/beach/shore/BeachSky'
import { CoconutToggle, Crab, NightSea, SleepyTurtle, Whale } from '@/components/beach/shore/Creatures'
import { Dolphins } from '@/components/beach/shore/Dolphins'
import { BeachBall, Kite, Sandcastle, Turtle } from '@/components/beach/shore/Extras'
import { PalmTree, Umbrella } from '@/components/beach/shore/PalmTree'
import { Sand } from '@/components/beach/shore/Sand'
import { Sea } from '@/components/beach/shore/Sea'
import { Shells } from '@/components/beach/shore/Shells'
import { ShoreGlow } from '@/components/beach/shore/Shoreline'
import { cannons } from '@/lib/celebrate'
import { bottleScreens, nextBeachMode, useNav, type BeachMode, type BottleScreen } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { config } from '@/config'

const tints = ['#5cc8d7', '#7fb8e6', '#8fd6c0', '#ffb38a']

// Where each bottle floats, as % of the sea area. Bottles further out are smaller.
const spots = [
  'left-[30%] top-[27%] scale-[0.86] md:left-[15%] md:top-[46%] md:scale-100',
  'left-[72%] top-[21%] scale-[0.8] md:left-[38%] md:top-[26%] md:scale-[0.84]',
  'left-[33%] top-[73%] md:left-[62%] md:top-[56%]',
  'left-[71%] top-[68%] md:left-[85%] md:top-[30%] md:scale-[0.86]',
]

// Everything below the horizon gets tinted by the light (multiply blend): warm at
// evening, deep blue at night. Glowing things (moon, jellyfish, plankton) sit above it.
const shade: Record<BeachMode, { backgroundColor: string; opacity: number }> = {
  day: { backgroundColor: '#ffffff', opacity: 0 },
  evening: { backgroundColor: '#ff9f7a', opacity: 0.42 },
  night: { backgroundColor: '#1a2758', opacity: 0.82 },
}

// Bottles sit above the tint (so their labels stay readable) and get a lighter touch.
const bottleLight: Record<BeachMode, string> = {
  day: 'none',
  evening: 'sepia(0.25) saturate(1.15) brightness(0.95)',
  night: 'brightness(0.72) saturate(0.7)',
}

// Palms sit above the glowing night waves, so they're shaded here instead of by the tint.
const palmLight: Record<BeachMode, string> = {
  day: 'none',
  evening: 'sepia(0.35) saturate(1.3) brightness(0.85) hue-rotate(-10deg)',
  night: 'brightness(0.32) saturate(0.5)',
}

// The ball can fly up into the sky (outside the tint), so it carries its own lighting.
const ballLight: Record<BeachMode, string> = {
  day: 'none',
  evening: 'sepia(0.3) saturate(1.2) brightness(0.88) hue-rotate(-8deg)',
  night: 'brightness(0.45) saturate(0.6)',
}

const SEA_BOX = 'absolute inset-x-0 top-[max(31%,15.5rem)] bottom-[23%] md:top-[max(34%,15rem)]'
const SAND_BOX = 'absolute inset-x-0 bottom-0 h-[23%]'

export default function Bottles() {
  const { go, opened, markOpened, revealed, beachMode: mode, setBeachMode } = useNav()
  const [busy, setBusy] = useState<BottleScreen | null>(null)
  // Snapshot on arrival, so opening the last bottle doesn't celebrate mid-transition
  const [allOpened] = useState(() => bottleScreens.every((s) => opened.has(s)))
  const cycle = () => setBeachMode(nextBeachMode[mode])
  const dark = mode !== 'day'

  // React Spring: each bottle bobs and drifts on the swell with its own rhythm.
  const [springs] = useSprings(4, (i) => ({
    from: { y: 0, x: 0, rotate: -6 + i * 2 },
    to: { y: -9 - (i % 2) * 5, x: i % 2 ? 6 : -6, rotate: 6 - i * 2 },
    loop: { reverse: true },
    delay: i * 300,
    config: { mass: 3 + i * 0.5, tension: 22, friction: 12 },
  }))

  useEffect(() => {
    if (allOpened && revealed) {
      const t = setTimeout(cannons, 400)
      return () => clearTimeout(t)
    }
  }, [allOpened, revealed])

  const open = (s: BottleScreen) => {
    markOpened(s)
    go(s)
  }

  return (
    <div className="relative h-dvh min-h-[600px] w-full overflow-hidden">
      {/* ── Sky: tap the sun / moon to change the time of day ── */}
      <BeachSky mode={mode} onToggle={cycle} />
      <Kite className="left-[9%] top-[20%] z-[2] md:left-[17%] md:top-[19%]" visible={mode === 'day'} />

      {/* ── Sea ── */}
      <div className={SEA_BOX}>
        <Sea mode={mode} />
        <Whale active={mode !== 'night'} />
        <Turtle className="top-[72%] z-[1]" visible={mode !== 'night'} />
        <Dolphins active={mode !== 'night'} />

        {bottleScreens.map((s, i) => (
          <div
            key={s}
            className={cn('absolute z-[14] -translate-x-1/2 -translate-y-1/2 transition-[filter] duration-[1600ms]', spots[i])}
            style={{ filter: bottleLight[mode] }}
          >
            <Reveal i={i + 2}>
              <animated.div style={springs[i]}>
                <Bottle
                  floating
                  index={i}
                  label={config.bottleLabels[i] ?? `Bottle ${i + 1}`}
                  tint={tints[i]}
                  opened={opened.has(s)}
                  disabled={busy !== null && busy !== s}
                  onStart={() => setBusy(s)}
                  onOpened={() => open(s)}
                  className={busy && busy !== s ? 'opacity-60' : ''}
                />
              </animated.div>
            </Reveal>
          </div>
        ))}
      </div>

      {/* ── Sand, palms and beach things (all under the light tint) ── */}
      <div className={cn(SAND_BOX, 'z-[6]')}>
        <Sand>
          <Umbrella className="absolute right-[14%] top-[18%] hidden w-[clamp(110px,14vw,170px)] md:block" />
          <Sandcastle className="absolute left-[71%] top-[28%] w-[clamp(52px,13vw,90px)] md:left-[58%] md:top-[16%]" />
        </Sand>
      </div>

      {/* ── Beach ball: lit by the time of day wherever it flies ── */}
      <div className={cn(SAND_BOX, 'z-[13] pointer-events-none transition-[filter] duration-[1600ms]')} style={{ filter: ballLight[mode] }}>
        <BeachBall className="pointer-events-auto left-[24%] top-[36%] md:left-[30%] md:top-[34%]" />
      </div>

      {/* ── Light tint below the horizon ── */}
      <motion.div
        className={cn(SEA_BOX, 'bottom-0 z-[12] mix-blend-multiply pointer-events-none')}
        initial={false}
        animate={shade[mode]}
        transition={{ duration: 1.8, ease: [0.45, 0, 0.2, 1] }}
      />

      {/* ── Night glow: moonlight, jellyfish, glowing waves ── */}
      <div className={cn(SEA_BOX, 'z-[13] pointer-events-none')}>
        <NightSea visible={mode === 'night'} />
      </div>
      <div className={cn(SAND_BOX, 'z-[13] pointer-events-none')}>
        <ShoreGlow visible={mode === 'night'} />
      </div>

      {/* ── Palms: planted in the sand, leaning out over the water (in front of the waves) ── */}
      <div className={cn(SAND_BOX, 'z-[13] pointer-events-none transition-[filter] duration-[1600ms]')} style={{ filter: palmLight[mode] }}>
        <PalmTree className="absolute bottom-[40%] left-[-13vw] h-[clamp(200px,31vh,500px)] sm:left-[-3vw] md:left-[2vw]" speed={5.5} />
        <PalmTree flip className="absolute bottom-[52%] right-[-15vw] h-[clamp(180px,27vh,420px)] sm:right-[-2vw] md:right-[3vw]" speed={6.5} />
      </div>

      {/* ── Things she can tap on the sand ── */}
      <div className={cn(SAND_BOX, 'z-[15] pointer-events-none')}>
        <Crab mode={mode} />
        <SleepyTurtle visible={mode === 'night'} className="left-[21%] top-[15%] md:left-[20%] md:top-[14%]" />
        <CoconutToggle mode={mode} onToggle={cycle} className="left-[15%] top-[62%] md:left-[12%] md:top-[60%]" />
        <Shells mode={mode} />
      </div>

      {/* ── Title in the sky ── */}
      <div className="pointer-events-none relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 pt-[max(1.25rem,env(safe-area-inset-top))] text-center sm:px-8">
        <div className="pointer-events-auto w-full text-left">
          <BackButton to="landing" label="home" light={dark} />
        </div>
        <ScriptTitle
          text="Pick a message in a bottle"
          tag="h2"
          className={cn(
            'mt-1 text-[clamp(2.4rem,9.5vw,5rem)] transition-colors duration-[1600ms]',
            dark ? 'text-cream glow-shadow-text' : 'text-ocean drop-shadow-[0_2px_0_rgba(255,248,236,0.9)]',
          )}
        />
        <Reveal i={1}>
          {revealed && (
            <TextAnimate
              animation="blurInUp"
              by="word"
              once
              className={cn('font-hand text-[clamp(1.05rem,4vw,1.5rem)] transition-colors duration-[1600ms]', dark ? 'text-cream/90' : 'text-ocean/85')}
            >
              {`${bottleScreens.length} little notes are floating in the sea, tap one`}
            </TextAnimate>
          )}
        </Reveal>
      </div>

      <AnimatePresence>
        {allOpened && (
          <motion.button
            type="button"
            onClick={() => go('wish')}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.8 }}
            className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-cream/95 px-4 py-3 text-left shadow-xl ring-1 ring-aqua/40 backdrop-blur"
          >
            <Sticker name="cake" size={44} />
            <span className="font-hand text-lg text-ocean sm:text-xl">{config.allOpenedMessage}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
