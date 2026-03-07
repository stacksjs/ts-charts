import type { TimeInterval } from './interval.ts'
import { timeInterval } from './interval.ts'
import { durationMinute, durationSecond } from './duration.ts'

export const timeMinute: TimeInterval = timeInterval((date: Date): void => {
  date.setTime(+date - date.getMilliseconds() - date.getSeconds() * durationSecond)
}, (date: Date, step: number): void => {
  date.setTime(+date + step * durationMinute)
}, (start: Date, end: Date): number => {
  return (+end - +start) / durationMinute
}, (date: Date): number => {
  return date.getMinutes()
})

export const timeMinutes: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeMinute.range

export const utcMinute: TimeInterval = timeInterval((date: Date): void => {
  date.setUTCSeconds(0, 0)
}, (date: Date, step: number): void => {
  date.setTime(+date + step * durationMinute)
}, (start: Date, end: Date): number => {
  return (+end - +start) / durationMinute
}, (date: Date): number => {
  return date.getUTCMinutes()
})

export const utcMinutes: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcMinute.range
