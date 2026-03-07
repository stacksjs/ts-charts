import { Timer } from './timer.ts'

export default function timeout(callback: (elapsed: number) => void, delay?: number | null, time?: number | null): Timer {
  const t = new Timer()
  const d = delay == null ? 0 : +delay
  t.restart((elapsed: number) => {
    t.stop()
    callback(elapsed + d)
  }, delay, time)
  return t
}
