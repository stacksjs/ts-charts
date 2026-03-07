import type { TimeInterval } from './interval.ts'
import { timeInterval } from './interval.ts'
import { durationHour, durationMinute, durationSecond } from './duration.ts'

export const timeHour: TimeInterval = timeInterval((date: Date): void => {
  date.setTime(+date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute)
}, (date: Date, step: number): void => {
  date.setTime(+date + step * durationHour)
}, (start: Date, end: Date): number => {
  return (+end - +start) / durationHour
}, (date: Date): number => {
  return date.getHours()
})

export const timeHours: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeHour.range

export const utcHour: TimeInterval = timeInterval((date: Date): void => {
  date.setUTCMinutes(0, 0, 0)
}, (date: Date, step: number): void => {
  date.setTime(+date + step * durationHour)
}, (start: Date, end: Date): number => {
  return (+end - +start) / durationHour
}, (date: Date): number => {
  return date.getUTCHours()
})

export const utcHours: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcHour.range
