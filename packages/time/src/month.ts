import type { TimeInterval } from './interval.ts'
import { timeInterval } from './interval.ts'

export const timeMonth: TimeInterval = timeInterval((date: Date): void => {
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
}, (date: Date, step: number): void => {
  date.setMonth(date.getMonth() + step)
}, (start: Date, end: Date): number => {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12
}, (date: Date): number => {
  return date.getMonth()
})

export const timeMonths: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeMonth.range

export const utcMonth: TimeInterval = timeInterval((date: Date): void => {
  date.setUTCDate(1)
  date.setUTCHours(0, 0, 0, 0)
}, (date: Date, step: number): void => {
  date.setUTCMonth(date.getUTCMonth() + step)
}, (start: Date, end: Date): number => {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12
}, (date: Date): number => {
  return date.getUTCMonth()
})

export const utcMonths: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcMonth.range
