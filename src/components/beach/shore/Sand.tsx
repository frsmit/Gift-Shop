import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Shoreline, WaveLayer } from './Shoreline'
import { config } from '@/config'

// The beach: waves lapping at the shore and her name written in the sand, which a bigger
// wave washes away every so often (and it gets rewritten).
export function Sand({ children }: { children?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // a big wave washes over the name, then it's rewritten
      gsap
        .timeline({ repeat: -1, repeatDelay: 7, delay: 5 })
        .to('.surge', { yPercent: 0, duration: 1.3, ease: 'power2.out' })
        .to('.sand-name', { opacity: 0, filter: 'blur(4px)', duration: 0.8 }, '-=0.5')
        .to('.surge', { yPercent: -100, duration: 1.6, ease: 'power2.inOut' })
        // clip box is padded past the glyphs so the handwritten final letter isn't cut off
        .set('.sand-name', { opacity: 1, filter: 'blur(0px)', clipPath: 'inset(-40% 100% -40% -20%)' })
        .to('.sand-name', { clipPath: 'inset(-40% -20% -40% -20%)', duration: 1.8, ease: 'power1.inOut', clearProps: 'clipPath' }, '+=0.4')
    },
    { scope: root },
  )

  return (
    <div ref={root} className="absolute inset-0">
      {/* dry sand with speckles */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f3dcae_0%,#f6e4bf_35%,#efd3a1_100%)]" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(rgba(176,138,85,.45) 1px, transparent 1.5px), radial-gradient(rgba(255,255,255,.7) 1px, transparent 1.5px)',
          backgroundSize: '14px 14px, 22px 22px',
          backgroundPosition: '0 0, 7px 11px',
        }}
      />

      {/* her name written in the sand */}
      <div className="absolute inset-x-0 top-[14%] flex justify-center md:top-[20%]">
        <span
          className="sand-name -rotate-3 px-4 font-marker text-[clamp(2.2rem,10vw,4rem)] leading-none text-[#b48b55]/80"
          style={{ textShadow: '0 1px 0 rgba(255,255,255,.55), 0 -1px 0 rgba(120,80,40,.35)' }}
        >
          {config.sandText}
        </span>
      </div>

      {/* the big wave that washes over the name — slides in from the sea with a curvy foam front */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%] overflow-hidden">
        <div className="surge absolute inset-0" style={{ transform: 'translateY(-100%)' }}>
          <div className="absolute inset-x-0 top-0 bottom-[40px] bg-[rgba(150,225,230,0.92)]" />
          <div className="absolute inset-x-0 bottom-0 h-[40px]">
            <WaveLayer base={16} seed={4.2} height={40} water={['rgba(150,225,230,0.92)', 'rgba(185,237,238,0.95)']} foam="#ffffff" className="animate-[shore-x_30s_linear_infinite]" />
          </div>
        </div>
      </div>

      <Shoreline />

      {children}
    </div>
  )
}
