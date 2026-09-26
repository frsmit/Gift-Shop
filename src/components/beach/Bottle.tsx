import { useId, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  tint?: string
  opened?: boolean
  onStart?: () => void
  onOpened?: () => void
  className?: string
  index?: number
  disabled?: boolean
  /** sitting in the sea: lower part under water, ripples around it */
  floating?: boolean
}

// A glass bottle with a rolled message inside. Tapping it plays a GSAP timeline:
// wiggle → cork pops → scroll flies out → onOpened().
export function Bottle({ label, tint = '#5cc8d7', opened, onStart, onOpened, className, index = 0, disabled, floating }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const id = useId().replace(/:/g, '')
  const playing = useRef(false)
  const { contextSafe } = useGSAP({ scope: ref })

  const open = contextSafe(() => {
    if (disabled || playing.current) return
    playing.current = true
    onStart?.()
    const tl = gsap.timeline({ onComplete: () => onOpened?.() })
    tl.to('.b-body', { rotate: -10, duration: 0.09, ease: 'power1.inOut', transformOrigin: '50% 90%' })
      .to('.b-body', { rotate: 10, duration: 0.12, ease: 'power1.inOut', repeat: 3, yoyo: true })
      .to('.b-body', { rotate: 0, duration: 0.12 })
      .to('.b-cork', { y: -90, x: 28, rotate: 220, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.05')
      .fromTo(
        '.b-pop',
        { scale: 0, opacity: 1 },
        { scale: 1.8, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.03 },
        '<',
      )
      .to('.b-scroll', { y: -150, rotate: 360, scale: 1.5, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.35')
      .to('.b-scroll', { opacity: 0, scale: 2.2, duration: 0.3 }, '-=0.1')
      .to('.b-glow', { opacity: 1, scale: 1.4, duration: 0.4 }, '<')
  })

  return (
    <button
      ref={ref}
      type="button"
      onClick={open}
      disabled={disabled}
      aria-label={`Open bottle: ${label}`}
      className={cn('group relative flex flex-col items-center outline-none', className)}
    >
      {/* soft glow used at the end of the timeline */}
      <span className="b-glow pointer-events-none absolute left-1/2 top-[20%] size-32 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#fff8ec_0%,transparent_70%)] opacity-0" />

      <div
        className={cn(
          'b-body relative transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:-translate-y-1',
          floating ? 'w-[clamp(52px,min(16vw,8.5vh),104px)]' : 'w-[clamp(78px,20vw,120px)]',
        )}
      >
        {floating && (
          <>
            {/* ripples spreading on the water around the bottle */}
            <span className="pointer-events-none absolute -inset-x-[45%] bottom-[4%] h-[16%] rounded-[50%] border-2 border-white/60 animate-[ripple_3.2s_ease-out_infinite]" />
            <span
              className="pointer-events-none absolute -inset-x-[45%] bottom-[4%] h-[16%] rounded-[50%] border-2 border-white/50 animate-[ripple_3.2s_ease-out_infinite]"
              style={{ animationDelay: '1.6s' }}
            />
          </>
        )}
        <svg
          viewBox="0 0 100 200"
          className={cn('w-full overflow-visible', !floating && 'drop-shadow-[0_14px_18px_rgba(14,59,92,0.35)]')}
        >
          <defs>
            <linearGradient id={`glass-${id}`} x1="0" x2="1">
              <stop offset="0" stopColor={tint} stopOpacity="0.55" />
              <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="1" stopColor={tint} stopOpacity="0.7" />
            </linearGradient>
            {/* floating: the glass fades out below the waterline (cork is outside the mask) */}
            <linearGradient id={`sub-grad-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="196">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id={`sub-${id}`} maskUnits="userSpaceOnUse" x="-100" y="-300" width="300" height="520">
              <rect x="-100" y="-300" width="300" height="520" fill={`url(#sub-grad-${id})`} />
            </mask>
          </defs>

          {/* pop sparkles */}
          {[
            [30, 10],
            [70, 6],
            [50, -6],
            [20, 24],
            [80, 22],
          ].map(([cx, cy], i) => (
            <circle key={i} className="b-pop" cx={cx} cy={cy} r="4" fill="#fff8ec" opacity="0" style={{ transformOrigin: `${cx}px ${cy}px` }} />
          ))}

          <g mask={floating ? `url(#sub-${id})` : undefined}>
            {/* scroll inside */}
            <g className="b-scroll" style={{ transformOrigin: '50px 125px', transformBox: 'view-box' }}>
              <rect x="36" y="88" width="28" height="74" rx="6" fill="#fff4dc" stroke="#e2c79b" strokeWidth="1.5" transform="rotate(-8 50 125)" />
              <rect x="34" y="118" width="32" height="8" rx="3" fill="#ff8a65" transform="rotate(-8 50 125)" />
            </g>
  
            {/* glass */}
            <path
              d="M42 26 L58 26 L58 58 C58 66 80 74 80 98 L80 176 C80 188 72 194 60 194 L40 194 C28 194 20 188 20 176 L20 98 C20 74 42 66 42 58 Z"
              fill={`url(#glass-${id})`}
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="2.5"
            />
            {/* water / sand at the bottom */}
            <path d="M22 170 Q50 162 78 170 L78 178 C78 188 70 192 60 192 L40 192 C30 192 22 188 22 178 Z" fill="#f3e2c3" opacity="0.9" />
            {/* highlight */}
            <path d="M29 100 C29 86 36 80 40 76" stroke="#fff" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M29 112 L29 160" stroke="#fff" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* cork */}
          <g className="b-cork" style={{ transformOrigin: '50px 18px', transformBox: 'view-box' }}>
            <rect x="39" y="8" width="22" height="22" rx="4" fill="#c99560" />
            <path d="M43 13 H57 M43 19 H57 M43 25 H57" stroke="#a8764a" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* string around the neck */}
          <path d="M41 40 Q50 45 59 40" stroke="#b07d4f" strokeWidth="2" fill="none" />
        </svg>

        {floating && (
          // foam ring where the glass meets the water
          <span className="pointer-events-none absolute -inset-x-[22%] bottom-[12%] z-10 h-[11%] rounded-[50%] border-2 border-white/80 bg-white/15" />
        )}
        {opened && (
          <span className="absolute -right-2 top-[30%] z-20 rounded-full bg-cream px-2 py-0.5 font-hand text-xs text-sea shadow ring-1 ring-aqua/50">
            read ✓
          </span>
        )}
      </div>

      {/* paper tag */}
      <span
        className={cn(
          'mt-2 max-w-[9.5rem] rounded-md bg-[#fff4dc] px-3 py-1.5 font-hand text-base leading-tight text-ocean shadow-md ring-1 ring-[#e2c79b] sm:text-lg',
          index % 2 ? 'rotate-2' : '-rotate-2',
          opened && 'opacity-80',
        )}
      >
        {label}
      </span>
    </button>
  )
}
