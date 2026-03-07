import type { TimeInterval } from './interval.ts'
import { timeInterval } from './interval.ts'
import { durationMinute, durationWeek } from './duration.ts'

function timeWeekday(i: number): TimeInterval {
  return timeInterval((date: Date): void => {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7)
    date.setHours(0, 0, 0, 0)
  }, (date: Date, step: number): void => {
    date.setDate(date.getDate() + step * 7)
  }, (start: Date, end: Date): number => {
    return (+end - +start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek
  })
}

export const timeSunday: TimeInterval = timeWeekday(0)
export const timeMonday: TimeInterval = timeWeekday(1)
export const timeTuesday: TimeInterval = timeWeekday(2)
export const timeWednesday: TimeInterval = timeWeekday(3)
export const timeThursday: TimeInterval = timeWeekday(4)
export const timeFriday: TimeInterval = timeWeekday(5)
export const timeSaturday: TimeInterval = timeWeekday(6)

export const timeSundays: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeSunday.range
export const timeMondays: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeMonday.range
export const timeTuesdays: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeTuesday.range
export const timeWednesdays: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeWednesday.range
export const timeThursdays: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeThursday.range
export const timeFridays: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeFriday.range
export const timeSaturdays: (start: Date | number, stop: Date | number, step?: number) => Date[] = timeSaturday.range

function utcWeekday(i: number): TimeInterval {
  return timeInterval((date: Date): void => {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7)
    date.setUTCHours(0, 0, 0, 0)
  }, (date: Date, step: number): void => {
    date.setUTCDate(date.getUTCDate() + step * 7)
  }, (start: Date, end: Date): number => {
    return (+end - +start) / durationWeek
  })
}

export const utcSunday: TimeInterval = utcWeekday(0)
export const utcMonday: TimeInterval = utcWeekday(1)
export const utcTuesday: TimeInterval = utcWeekday(2)
export const utcWednesday: TimeInterval = utcWeekday(3)
export const utcThursday: TimeInterval = utcWeekday(4)
export const utcFriday: TimeInterval = utcWeekday(5)
export const utcSaturday: TimeInterval = utcWeekday(6)

export const utcSundays: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcSunday.range
export const utcMondays: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcMonday.range
export const utcTuesdays: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcTuesday.range
export const utcWednesdays: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcWednesday.range
export const utcThursdays: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcThursday.range
export const utcFridays: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcFriday.range
export const utcSaturdays: (start: Date | number, stop: Date | number, step?: number) => Date[] = utcSaturday.range
