import { createContext, useContext } from 'react'

export type Screen = 'gate' | 'landing' | 'bottles' | 'favourite' | 'letter' | 'memories' | 'wish'

export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'golden' | 'sunset'

// The day moves forward as she goes deeper: sea-breeze morning → sunset.
export const timeOf: Record<Screen, TimeOfDay> = {
  gate: 'dawn',
  landing: 'morning',
  bottles: 'noon',
  favourite: 'noon',
  letter: 'afternoon',
  memories: 'golden',
  wish: 'sunset',
}

/** The beach (bottles screen) has its own day → evening → night cycle she can toggle. */
export type BeachMode = 'day' | 'evening' | 'night'
export const nextBeachMode: Record<BeachMode, BeachMode> = { day: 'evening', evening: 'night', night: 'day' }

export const bottleScreens = ['favourite', 'letter', 'memories', 'wish'] as const
export type BottleScreen = (typeof bottleScreens)[number]

type NavValue = {
  screen: Screen
  go: (next: Screen) => void
  /** true once the tide has pulled back and the screen is visible */
  revealed: boolean
  opened: ReadonlySet<BottleScreen>
  markOpened: (s: BottleScreen) => void
  resetOpened: () => void
  beachMode: BeachMode
  setBeachMode: (m: BeachMode) => void
  music: { playing: boolean; available: boolean; play: () => void; toggle: () => void }
}

export const NavContext = createContext<NavValue | null>(null)

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used inside <NavContext.Provider>')
  return ctx
}
