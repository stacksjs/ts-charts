import type { TimeInterval } from './interval.ts'
import { timeInterval } from './interval.ts'

export const timeYear: TimeInterval = timeInterval((date: Date): void => {
  date.setMonth(0, 1)
  date.setHours(0, 0, 0, 0)
}, (date: Date, step: number): void => {
  date.setFullYear(date.getFullYear() + step)
}, (start: Date, end: Date): number => {
  return end.getFullYear() - start.getFullYear()
}, (date: Date): number => {
  return date.getFullYear()
})

// An optimized implementation for this simple case.
timeYear.every = (k: number): TimeInterval | null => {
  k = Math.floor(k)
  return !isFinite(k) || !(k > 0) ? null : timeInterval((date: Date): void => {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k)
    date.setMonth(0, 1)
    date.setHours(0, 0, 0, 0)
  }, (date: Date, step: number): void => {
    date.setFullYear(date.getFullYear() + step * k)
  })
}

export const timeYears: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeYear.range

export const utcYear: TimeInterval = timeInterval((date: Date): void => {
  date.setUTCMonth(0, 1)
  date.setUTCHours(0, 0, 0, 0)
}, (date: Date, step: number): void => {
  date.setUTCFullYear(date.getUTCFullYear() + step)
}, (start: Date, end: Date): number => {
  return end.getUTCFullYear() - start.getUTCFullYear()
}, (date: Date): number => {
  return date.getUTCFullYear()
})

// An optimized implementation for this simple case.
utcYear.every = (k: number): TimeInterval | null => {
  k = Math.floor(k)
  return !isFinite(k) || !(k > 0) ? null : timeInterval((date: Date): void => {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k)
    date.setUTCMonth(0, 1)
    date.setUTCHours(0, 0, 0, 0)
  }, (date: Date, step: number): void => {
    date.setUTCFullYear(date.getUTCFullYear() + step * k)
  })
}

export const utcYears: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcYear.range
