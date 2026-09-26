import { useState } from 'react'
import { animated, to as interpolate, useSprings } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { Marquee } from '@/components/ui/marquee'
import { Sticker, type StickerName } from '@/components/beach/Sticker'
import { BackButton, Polaroid, Reveal, ScreenShell, ScriptTitle } from '@/components/beach/ui'
import { config, photo, photoCaption } from '@/config'

type Card = { caption: string; src?: string; index?: number; sticker?: StickerName }

const cardStickers: StickerName[] = ['cool', 'watermelon', 'camera', 'sunset', 'party']
const ribbon: StickerName[] = ['wave', 'dolphin', 'icecream', 'sunface', 'turtle', 'drink', 'whale', 'seal', 'octopus', 'watermelon']

// Photos 3+ go in the deck (all of them, however many links there are); with only
// 3–4 photos we reuse earlier ones so there are always at least two photo cards.
// Remaining captions become sticker cards. A caption given with a link wins.
function buildCards(): Card[] {
  const total = config.photos.length
  const deckPhotos = total > 2 ? total - 2 : 0
  const photoCards = Math.max(2, deckPhotos)
  const count = Math.max(config.memoryCaptions.length, photoCards)
  return Array.from({ length: count }, (_, i) => {
    const fallback = config.memoryCaptions[i] ?? ''
    if (i >= photoCards) return { caption: fallback, sticker: cardStickers[i % cardStickers.length] }
    const index = total ? (i < deckPhotos ? 2 + i : i) : 2 + i
    return { caption: photoCaption(index, fallback), src: photo(index), index }
  })
}

const cards = buildCards()

const settle = (i: number) => ({ x: 0, y: -i * 4, scale: 1, rot: -8 + Math.random() * 16, delay: i * 90 })
const fromBelow = () => ({ x: 0, rot: 0, scale: 1.4, y: 1000 })

export default function Memories() {
  const [gone] = useState(() => new Set<number>())
  const [springs, api] = useSprings(cards.length, (i) => ({ ...settle(i), from: fromBelow() }))

  // React Spring + use-gesture: fling a polaroid off the deck; the deck refills when empty.
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2 || Math.abs(mx) > 120
    if (!active && trigger) gone.add(index)
    api.start((i) => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * (xDir || (mx > 0 ? 1 : -1)) : active ? mx : 0
      const rot = mx / 90 + (isGone ? xDir * 10 * vx : 0)
      return {
        x,
        rot,
        scale: active ? 1.08 : 1,
        delay: undefined,
        config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
      }
    })
    if (!active && gone.size === cards.length) {
      setTimeout(() => {
        gone.clear()
        api.start((i) => settle(i))
      }, 600)
    }
  })

  return (
    <ScreenShell className="gap-3 overflow-hidden">
      <div className="w-full self-start text-left">
        <BackButton />
      </div>

      <ScriptTitle text={config.memoriesTitle} tag="h2" className="text-[clamp(2.8rem,11vw,5.5rem)] text-ocean drop-shadow-[0_2px_0_rgba(255,248,236,0.8)]" />
      <Reveal i={1}>
        <p className="font-hand text-lg text-ocean/80 sm:text-xl">swipe the polaroids ↔</p>
      </Reveal>

      <Reveal i={2} className="relative my-2 flex h-[min(62vh,480px)] w-full items-center justify-center">
        {springs.map(({ x, y, rot, scale }, i) => {
          const card = cards[i]
          return (
            // first card on top, so her photos come before the sticker cards
            <animated.div key={i} className="absolute will-change-transform" style={{ x, y, zIndex: cards.length - i }}>
              <animated.div
                {...bind(i)}
                className="w-[min(72vw,320px)] cursor-grab touch-none select-none active:cursor-grabbing"
                style={{ transform: interpolate([rot, scale], (r, s) => `perspective(1500px) rotateX(10deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`) }}
              >
                {card.src ? (
                  <Polaroid src={card.src} index={card.index} caption={card.caption} tape={i % 2 === 0} />
                ) : (
                  <figure className="polaroid relative">
                    <div className="flex aspect-square w-full items-center justify-center bg-[linear-gradient(160deg,#9fdaf2,#fff2de)]">
                      <Sticker name={card.sticker!} size="clamp(96px, 32vw, 150px)" />
                    </div>
                    <figcaption className="absolute inset-x-0 bottom-1.5 text-center font-marker text-lg text-ocean sm:bottom-2.5 sm:text-xl">
                      {card.caption}
                    </figcaption>
                  </figure>
                )}
              </animated.div>
            </animated.div>
          )
        })}
      </Reveal>

      <ScriptTitle text={config.memoriesFooter} tag="p" delay={30} className="text-[clamp(2.2rem,9vw,4.5rem)] text-cream glow-shadow-text" />

      {/* Magic UI marquee: a sticker "beach towel" ribbon */}
      <Reveal i={4} className="w-screen">
        <Marquee pauseOnHover className="[--duration:28s] [--gap:1.5rem]">
          {ribbon.map((s) => (
            <Sticker key={s} name={s} size="clamp(40px, 9vw, 56px)" />
          ))}
        </Marquee>
      </Reveal>
    </ScreenShell>
  )
}
