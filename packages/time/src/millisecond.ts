import type { TimeInterval } from './interval.ts'
import { timeInterval } from './interval.ts'

export const millisecond: TimeInterval = timeInterval((): void => {
  // noop
}, (date: Date, step: number): void => {
  date.setTime(+date + step)
}, (start: Date, end: Date): number => {
  return +end - +start
})

// An optimized implementation for this simple case.
millisecond.every = (k: number): TimeInterval | null => {
  k = Math.floor(k)
  if (!isFinite(k) || !(k > 0)) return null
  if (!(k > 1)) return millisecond
  return timeInterval((date: Date): void => {
    date.setTime(Math.floor(+date / k) * k)
  }, (date: Date, step: number): void => {
    date.setTime(+date + step * k)
  }, (start: Date, end: Date): number => {
    return (+end - +start) / k
  })
}

export const milliseconds: (start: Date | number, stop: Date | number, step?: number) => Date[] = millisecond.range
