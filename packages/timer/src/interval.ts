import { Timer, now } from './timer.ts'

export default function interval(callback: (elapsed: number) => void, delay?: number | null, time?: number | null): Timer & { _restart?: (callback: (elapsed: number) => void, delay?: number | null, time?: number | null) => void } {
  const t = new Timer()
  let total = delay == null ? 0 : +delay
  if (delay == null) {
    t.restart(callback, delay, time)
    // eslint-disable-next-line pickier/no-unused-vars
    return t
  }
  const originalRestart = t.restart.bind(t)
  // eslint-disable-next-line pickier/no-unused-vars
  ;(t as Timer & { _restart: typeof t.restart })._restart = originalRestart
  t.restart = function (cb: (elapsed: number) => void, d?: number | null, tm?: number | null): void {
    const resolvedDelay = d == null ? 0 : +d
    const resolvedTime = tm == null ? now() : +tm
    total = resolvedDelay
    originalRestart(function tick(elapsed: number): void {
      elapsed += total
      originalRestart(tick, total += resolvedDelay, resolvedTime)
      cb(elapsed)
    }, resolvedDelay, resolvedTime)
  }
  t.restart(callback, delay, time)
  return t
}
