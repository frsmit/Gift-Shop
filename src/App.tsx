import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig, useAnimate, useReducedMotion } from 'motion/react'
import ClickSpark from '@/components/ClickSpark'
import { Confetti } from '@/components/ui/confetti'
import { MusicToggle } from '@/components/beach/MusicToggle'
import { Scene } from '@/components/beach/Scene'
import { Tide } from '@/components/beach/Tide'
import { registerConfetti } from '@/lib/celebrate'
import { NavContext, timeOf, type BeachMode, type BottleScreen, type Screen } from '@/lib/nav'
import { config } from '@/config'
import Gate from '@/screens/Gate'
import Landing from '@/screens/Landing'

// Later screens load on demand so the first paint stays light on mobile data.
const Bottles = lazy(() => import('@/screens/Bottles'))
const Favourite = lazy(() => import('@/screens/Favourite'))
const Letter = lazy(() => import('@/screens/Letter'))
const Memories = lazy(() => import('@/screens/Memories'))
const Wish = lazy(() => import('@/screens/Wish'))

const screens: Record<Screen, React.ComponentType> = {
  gate: Gate,
  landing: Landing,
  bottles: Bottles,
  favourite: Favourite,
  letter: Letter,
  memories: Memories,
  wish: Wish,
}

const preload = () => {
  void import('@/screens/Bottles')
  void import('@/screens/Favourite')
  void import('@/screens/Letter')
  void import('@/screens/Memories')
  void import('@/screens/Wish')
}

const initialScreen = (): Screen => {
  const preview = new URLSearchParams(window.location.search).has('preview')
  const locked = config.countdown && !preview && Date.now() < config.birthdayAt.getTime()
  return locked || config.passcode ? 'gate' : 'landing'
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [revealed, setRevealed] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [opened, setOpened] = useState<Set<BottleScreen>>(() => new Set())
  const [beachMode, setBeachMode] = useState<BeachMode>('day')
  const [tide, animateTide] = useAnimate<HTMLDivElement>()
  const busy = useRef(false)
  const reduced = useReducedMotion()

  // ── Tide transition: wave rises over the page, swap, wave recedes ──
  const navigate = useCallback(
    async (next: Screen, push = true) => {
      if (busy.current) return
      busy.current = true
      setTransitioning(true)
      if (push) history.pushState({ screen: next }, '')

      if (reduced) {
        setScreen(next)
      } else {
        await animateTide(tide.current, { y: ['105%', '0%'] }, { duration: 0.85, ease: [0.65, 0, 0.35, 1] })
        setRevealed(false)
        setScreen(next)
        await wait(260)
      }
      setRevealed(true)
      if (!reduced) {
        await animateTide(tide.current, { y: ['0%', '105%'] }, { duration: 0.95, ease: [0.65, 0, 0.35, 1] })
      }
      busy.current = false
      setTransitioning(false)
    },
    [animateTide, reduced, tide],
  )

  // Hardware / browser back button moves between screens instead of leaving the site.
  useEffect(() => {
    history.replaceState({ screen }, '')
    const onPop = (e: PopStateEvent) => {
      const target = (e.state?.screen as Screen | undefined) ?? 'landing'
      void navigate(target === 'gate' ? 'landing' : target, false)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  useEffect(() => {
    document.title = config.pageTitle
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500))
    idle(preload)
  }, [])

  // ── Music: fades in on first tap, loops, remembers pause ──
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const fade = useRef<number>(0)

  const fadeTo = useCallback((target: number, done?: () => void) => {
    const el = audio.current
    if (!el) return
    cancelAnimationFrame(fade.current)
    const from = el.volume
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1200)
      // clamp: float rounding can land a hair outside [0, 1], which the browser rejects
      el.volume = Math.min(1, Math.max(0, from + (target - from) * p))
      if (p < 1) fade.current = requestAnimationFrame(step)
      else done?.()
    }
    fade.current = requestAnimationFrame(step)
  }, [])

  const play = useCallback(() => {
    const el = audio.current
    if (!el || !el.paused) return
    el.volume = 0
    el.play()
      .then(() => {
        setPlaying(true)
        fadeTo(config.songVolume)
      })
      .catch(() => setPlaying(false))
  }, [fadeTo])

  const toggle = useCallback(() => {
    const el = audio.current
    if (!el) return
    if (el.paused) play()
    else {
      setPlaying(false)
      fadeTo(0, () => el.pause())
    }
  }, [fadeTo, play])

  const nav = useMemo(
    () => ({
      screen,
      go: (next: Screen) => void navigate(next),
      revealed,
      opened,
      markOpened: (s: BottleScreen) => setOpened((prev) => new Set(prev).add(s)),
      resetOpened: () => setOpened(new Set()),
      beachMode,
      setBeachMode,
      music: { playing, available: Boolean(config.song), play, toggle },
    }),
    [screen, navigate, revealed, opened, beachMode, playing, play, toggle],
  )

  const Current = screens[screen]

  return (
    <MotionConfig reducedMotion="user">
      <NavContext.Provider value={nav}>
        <ClickSpark sparkColor="#fff8ec" sparkSize={9} sparkRadius={18} sparkCount={9} duration={450}>
          <Scene time={timeOf[screen]} />

          <main
            key={screen}
            className="fixed inset-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none]"
            aria-busy={transitioning}
          >
            <Suspense fallback={null}>
              <Current />
            </Suspense>
          </main>

          <MusicToggle />
          <Tide ref={tide} />
          {/* Block taps mid-transition */}
          {transitioning && <div className="fixed inset-0 z-[55]" />}

          <Confetti
            ref={registerConfetti}
            manualstart
            className="pointer-events-none fixed inset-0 z-[60] size-full"
          />
          {/* Muted until she taps the music button; preload="none" so the song only downloads then */}
          {config.song && <audio ref={audio} src={config.song} loop preload="none" />}
        </ClickSpark>
      </NavContext.Provider>
    </MotionConfig>
  )
}
