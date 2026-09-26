import { cn } from '@/lib/utils'

// Animated Noto Emoji stickers (CC BY 4.0, Google) resized by scripts/stickers.mjs
const files = import.meta.glob('/src/assets/stickers/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const stickers = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace('.webp', ''), url]),
)

export type StickerName =
  | 'wave' | 'sunface' | 'crab' | 'dolphin' | 'whale' | 'turtle' | 'octopus' | 'cake' | 'party'
  | 'partyface' | 'drink' | 'sunset' | 'sparkles' | 'gift' | 'balloon'
  | 'cool' | 'hug' | 'icecream' | 'watermelon' | 'star' | 'bubbles'
  | 'camera' | 'confetti' | 'crystal' | 'seal' | 'jellyfish' | 'crab-sleep' | 'turtle-sleep'

export function Sticker({
  name,
  className,
  size = 64,
  eager = false,
}: {
  name: StickerName
  className?: string
  size?: number | string
  eager?: boolean
}) {
  return (
    <img
      src={stickers[name]}
      alt=""
      aria-hidden
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('pointer-events-none select-none drop-shadow-[0_6px_10px_rgba(14,59,92,0.25)]', className)}
      style={{ width: size, height: size }}
    />
  )
}
