import type { TimeInterval } from './interval.ts'
import { timeInterval } from './interval.ts'
import { durationSecond } from './duration.ts'

export const second: TimeInterval = timeInterval((date: Date): void => {
  date.setTime(+date - date.getMilliseconds())
}, (date: Date, step: number): void => {
  date.setTime(+date + step * durationSecond)
}, (start: Date, end: Date): number => {
  return (+end - +start) / durationSecond
}, (date: Date): number => {
  return date.getUTCSeconds()
})

export const seconds: (start: Date | number, stop: Date | number, step?: number) => Date[] = second.range
