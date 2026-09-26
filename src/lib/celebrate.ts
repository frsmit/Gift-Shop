import type { ConfettiRef } from '@/components/ui/confetti'

// App mounts one full-screen Magic UI <Confetti> and registers it here.
let instance: ConfettiRef | null = null
export const registerConfetti = (ref: ConfettiRef | null) => {
  instance = ref
}

const colors = ['#5cc8d7', '#1b8eb0', '#fff8ec', '#ffc49b', '#ff8a65', '#ffd27a']
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function burst(origin = { x: 0.5, y: 0.6 }) {
  if (reduced()) return
  void instance?.fire({ particleCount: 120, spread: 90, startVelocity: 45, origin, colors, scalar: 1.05 })
}

export function cannons() {
  if (reduced()) return
  const end = Date.now() + 1600
  const frame = () => {
    void instance?.fire({ particleCount: 5, angle: 60, spread: 60, startVelocity: 60, origin: { x: 0, y: 0.75 }, colors })
    void instance?.fire({ particleCount: 5, angle: 120, spread: 60, startVelocity: 60, origin: { x: 1, y: 0.75 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

export function shells() {
  if (reduced()) return
  void instance?.fire({
    particleCount: 40,
    spread: 120,
    startVelocity: 35,
    origin: { x: 0.5, y: 0.5 },
    shapes: ['circle'],
    colors: ['#fff8ec', '#dff6f5', '#ffc49b'],
    scalar: 1.4,
  })
}
