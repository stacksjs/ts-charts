import type { TimeInterval } from './interval.ts'
import { timeInterval } from './interval.ts'
import { durationDay, durationMinute } from './duration.ts'

export const timeDay: TimeInterval = timeInterval(
  (date: Date): void => { date.setHours(0, 0, 0, 0) },
  (date: Date, step: number): void => { date.setDate(date.getDate() + step) },
  (start: Date, end: Date): number => (+end - +start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
  (date: Date): number => date.getDate() - 1,
)

export const timeDays: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeDay.range

export const utcDay: TimeInterval = timeInterval((date: Date): void => {
  date.setUTCHours(0, 0, 0, 0)
}, (date: Date, step: number): void => {
  date.setUTCDate(date.getUTCDate() + step)
}, (start: Date, end: Date): number => {
  return (+end - +start) / durationDay
}, (date: Date): number => {
  return date.getUTCDate() - 1
})

export const utcDays: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcDay.range

export const unixDay: TimeInterval = timeInterval((date: Date): void => {
  date.setUTCHours(0, 0, 0, 0)
}, (date: Date, step: number): void => {
  date.setUTCDate(date.getUTCDate() + step)
}, (start: Date, end: Date): number => {
  return (+end - +start) / durationDay
}, (date: Date): number => {
  return Math.floor(+date / durationDay)
})

export const unixDays: (start: Date | number, stop: Date | number, step?: number) => Date[] = unixDay.range
