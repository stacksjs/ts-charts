import { describe, expect, it } from 'bun:test'
import { timeDay, timeDays, timeYear } from '../src/index.ts'
import { local, utc } from './date.ts'

describe('timeDay', () => {
  it('timeDays in an alias for timeDay.range', () => {
    expect(timeDays).toBe(timeDay.range)
  })

  it('timeDay() is equivalent to timeDay.floor(new Date)', () => {
    const t = new Date()
    expect(timeDay()).toEqual(timeDay.floor(t))
  })

  it('timeDay(date) is equivalent to timeDay.floor(date)', () => {
    const t = new Date()
    expect(timeDay(t)).toEqual(timeDay.floor(t))
  })

  it('timeDay.floor(date) returns days', () => {
    expect(timeDay.floor(local(2010, 11, 31, 23))).toEqual(local(2010, 11, 31))
    expect(timeDay.floor(local(2011,  0,  1,  0))).toEqual(local(2011,  0,  1))
    expect(timeDay.floor(local(2011,  0,  1,  1))).toEqual(local(2011,  0,  1))
  })

  it('timeDay.floor(date) observes daylight saving', () => {
    expect(timeDay.floor(utc(2011,  2, 13,  7))).toEqual(local(2011,  2, 12))
    expect(timeDay.floor(utc(2011,  2, 13,  8))).toEqual(local(2011,  2, 13))
    expect(timeDay.floor(utc(2011,  2, 13,  9))).toEqual(local(2011,  2, 13))
    expect(timeDay.floor(utc(2011,  2, 13, 10))).toEqual(local(2011,  2, 13))
    expect(timeDay.floor(utc(2011, 10,  6,  7))).toEqual(local(2011, 10,  6))
    expect(timeDay.floor(utc(2011, 10,  6,  8))).toEqual(local(2011, 10,  6))
    expect(timeDay.floor(utc(2011, 10,  6,  9))).toEqual(local(2011, 10,  6))
    expect(timeDay.floor(utc(2011, 10,  6, 10))).toEqual(local(2011, 10,  6))
  })

  it('timeDay.floor(date) handles years in the first century', () => {
    expect(timeDay.floor(local(9, 10,  6,  7))).toEqual(local(9, 10,  6))
  })

  it('timeDay.round(date) returns days', () => {
    expect(timeDay.round(local(2010, 11, 30, 13))).toEqual(local(2010, 11, 31))
    expect(timeDay.round(local(2010, 11, 30, 11))).toEqual(local(2010, 11, 30))
  })

  it('timeDay.round(date) observes daylight saving', () => {
    expect(timeDay.round(utc(2011,  2, 13,  7))).toEqual(local(2011,  2, 13))
    expect(timeDay.round(utc(2011,  2, 13,  8))).toEqual(local(2011,  2, 13))
    expect(timeDay.round(utc(2011,  2, 13,  9))).toEqual(local(2011,  2, 13))
    expect(timeDay.round(utc(2011,  2, 13, 20))).toEqual(local(2011,  2, 14))
    expect(timeDay.round(utc(2011, 10,  6,  7))).toEqual(local(2011, 10,  6))
    expect(timeDay.round(utc(2011, 10,  6,  8))).toEqual(local(2011, 10,  6))
    expect(timeDay.round(utc(2011, 10,  6,  9))).toEqual(local(2011, 10,  6))
    expect(timeDay.round(utc(2011, 10,  6, 20))).toEqual(local(2011, 10,  7))
  })

  it('timeDay.round(date) handles midnight in leap years', () => {
    expect(timeDay.round(utc(2012,  2,  1,  0))).toEqual(local(2012,  2,  1))
    expect(timeDay.round(utc(2012,  2,  1,  0))).toEqual(local(2012,  2,  1))
  })

  it('timeDay.ceil(date) returns days', () => {
    expect(timeDay.ceil(local(2010, 11, 30, 23))).toEqual(local(2010, 11, 31))
    expect(timeDay.ceil(local(2010, 11, 31,  0))).toEqual(local(2010, 11, 31))
    expect(timeDay.ceil(local(2010, 11, 31,  1))).toEqual(local(2011,  0,  1))
  })

  it('timeDay.ceil(date) observes start of daylight saving', () => {
    expect(timeDay.ceil(utc(2011,  2, 13,  7))).toEqual(local(2011,  2, 13))
    expect(timeDay.ceil(utc(2011,  2, 13,  8))).toEqual(local(2011,  2, 13))
    expect(timeDay.ceil(utc(2011,  2, 13,  9))).toEqual(local(2011,  2, 14))
    expect(timeDay.ceil(utc(2011,  2, 13, 10))).toEqual(local(2011,  2, 14))
  })

  it('timeDay.ceil(date) observes end of daylight saving', () => {
    expect(timeDay.ceil(utc(2011, 10,  6,  7))).toEqual(local(2011, 10,  6))
    expect(timeDay.ceil(utc(2011, 10,  6,  8))).toEqual(local(2011, 10,  7))
    expect(timeDay.ceil(utc(2011, 10,  6,  9))).toEqual(local(2011, 10,  7))
    expect(timeDay.ceil(utc(2011, 10,  6, 10))).toEqual(local(2011, 10,  7))
  })

  it('timeDay.ceil(date) handles midnight for leap years', () => {
    expect(timeDay.ceil(utc(2012,  2,  1,  0))).toEqual(local(2012,  2,  1))
    expect(timeDay.ceil(utc(2012,  2,  1,  0))).toEqual(local(2012,  2,  1))
  })

  it('timeDay.offset(date) is an alias for timeDay.offset(date, 1)', () => {
    expect(timeDay.offset(local(2010, 11, 31, 23, 59, 59, 999))).toEqual(local(2011,  0,  1, 23, 59, 59, 999))
  })

  it('timeDay.offset(date, step) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeDay.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })

  it('timeDay.offset(date, step) does not round the passed-in date', () => {
    expect(timeDay.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011,  0,  1, 23, 59, 59, 999))
    expect(timeDay.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2010, 11, 29, 23, 59, 59, 456))
  })

  it('timeDay.offset(date, step) allows step to be negative', () => {
    expect(timeDay.offset(local(2010, 11, 31), -1)).toEqual(local(2010, 11, 30))
    expect(timeDay.offset(local(2011,  0,  1), -2)).toEqual(local(2010, 11, 30))
    expect(timeDay.offset(local(2011,  0,  1), -1)).toEqual(local(2010, 11, 31))
  })

  it('timeDay.offset(date, step) allows step to be positive', () => {
    expect(timeDay.offset(local(2010, 11, 31), +1)).toEqual(local(2011,  0,  1))
    expect(timeDay.offset(local(2010, 11, 30), +2)).toEqual(local(2011,  0,  1))
    expect(timeDay.offset(local(2010, 11, 30), +1)).toEqual(local(2010, 11, 31))
  })

  it('timeDay.offset(date, step) allows step to be zero', () => {
    expect(timeDay.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeDay.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })

  it('timeDay.range(start, stop) returns days between start (inclusive) and stop (exclusive)', () => {
    expect(timeDay.range(local(2011, 10,  4), local(2011, 10, 10))).toEqual([
      local(2011, 10,  4),
      local(2011, 10,  5),
      local(2011, 10,  6),
      local(2011, 10,  7),
      local(2011, 10,  8),
      local(2011, 10,  9),
    ])
  })

  it('timeDay.range(start, stop) returns days', () => {
    expect(timeDay.range(local(2011, 10,  4,  2), local(2011, 10, 10, 13))).toEqual([
      local(2011, 10,  5),
      local(2011, 10,  6),
      local(2011, 10,  7),
      local(2011, 10,  8),
      local(2011, 10,  9),
      local(2011, 10, 10),
    ])
  })

  it('timeDay.range(start, stop) coerces start and stop to dates', () => {
    expect(timeDay.range(+local(2011, 10,  4), +local(2011, 10,  7))).toEqual([
      local(2011, 10,  4),
      local(2011, 10,  5),
      local(2011, 10,  6),
    ])
  })

  it('timeDay.range(start, stop) returns the empty array for invalid dates', () => {
    expect(timeDay.range(new Date(NaN), Infinity)).toEqual([])
  })

  it('timeDay.range(start, stop) returns the empty array if start >= stop', () => {
    expect(timeDay.range(local(2011, 10, 10), local(2011, 10,  4))).toEqual([])
    expect(timeDay.range(local(2011, 10, 10), local(2011, 10, 10))).toEqual([])
  })

  it('timeDay.range(start, stop, step) returns every step day', () => {
    expect(timeDay.range(local(2011, 10,  4,  2), local(2011, 10, 14, 13), 3)).toEqual([
      local(2011, 10,  5),
      local(2011, 10,  8),
      local(2011, 10, 11),
      local(2011, 10, 14),
    ])
  })

  it('timeDay.range(start, stop, step) returns the empty array if step is zero, negative or NaN', () => {
    expect(timeDay.range(local(2011,  0,  1,  0), local(2011,  4,  9,  0), 0)).toEqual([])
    expect(timeDay.range(local(2011,  0,  1,  0), local(2011,  4,  9,  0), -1)).toEqual([])
    expect(timeDay.range(local(2011,  0,  1,  0), local(2011,  4,  9,  0), 0.5)).toEqual([])
    expect(timeDay.range(local(2011,  0,  1,  0), local(2011,  4,  9,  0), NaN)).toEqual([])
  })

  it('timeDay.count(start, end) counts days after start (exclusive) and before end (inclusive)', () => {
    expect(timeDay.count!(local(2011,  0,  1,  0), local(2011,  4,  9,  0))).toBe(128)
    expect(timeDay.count!(local(2011,  0,  1,  1), local(2011,  4,  9,  0))).toBe(128)
    expect(timeDay.count!(local(2010, 11, 31, 23), local(2011,  4,  9,  0))).toBe(129)
    expect(timeDay.count!(local(2011,  0,  1,  0), local(2011,  4,  8, 23))).toBe(127)
    expect(timeDay.count!(local(2011,  0,  1,  0), local(2011,  4,  9,  1))).toBe(128)
  })

  it('timeDay.count(start, end) observes daylight saving', () => {
    expect(timeDay.count!(local(2011,  0,  1), local(2011,  2, 13,  1))).toBe(71)
    expect(timeDay.count!(local(2011,  0,  1), local(2011,  2, 13,  3))).toBe(71)
    expect(timeDay.count!(local(2011,  0,  1), local(2011,  2, 13,  4))).toBe(71)
    expect(timeDay.count!(local(2011,  0,  1), local(2011, 10,  6,  0))).toBe(309)
    expect(timeDay.count!(local(2011,  0,  1), local(2011, 10,  6,  1))).toBe(309)
    expect(timeDay.count!(local(2011,  0,  1), local(2011, 10,  6,  2))).toBe(309)
  })

  it('timeDay.count(start, stop) does not exhibit floating-point rounding error', () => {
    const date = new Date(2011, 4, 9)
    expect(timeDay.count!(timeYear(date), date)).toBe(128)
  })

  it('timeDay.count(start, end) returns 364 or 365 for a full year', () => {
    expect(timeDay.count!(local(1999,  0,  1), local(1999, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2000,  0,  1), local(2000, 11, 31))).toBe(365)
    expect(timeDay.count!(local(2001,  0,  1), local(2001, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2002,  0,  1), local(2002, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2003,  0,  1), local(2003, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2004,  0,  1), local(2004, 11, 31))).toBe(365)
    expect(timeDay.count!(local(2005,  0,  1), local(2005, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2006,  0,  1), local(2006, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2007,  0,  1), local(2007, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2008,  0,  1), local(2008, 11, 31))).toBe(365)
    expect(timeDay.count!(local(2009,  0,  1), local(2009, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2010,  0,  1), local(2010, 11, 31))).toBe(364)
    expect(timeDay.count!(local(2011,  0,  1), local(2011, 11, 31))).toBe(364)
  })

  it('timeDay.every(step) returns every stepth day, starting with the first day of the month', () => {
    expect(timeDay.every!(3)!.range(local(2008, 11, 30, 0, 12), local(2009, 0, 5, 23, 48))).toEqual([local(2008, 11, 31), local(2009, 0, 1), local(2009, 0, 4)])
    expect(timeDay.every!(5)!.range(local(2008, 11, 30, 0, 12), local(2009, 0, 6, 23, 48))).toEqual([local(2008, 11, 31), local(2009, 0, 1), local(2009, 0, 6)])
    expect(timeDay.every!(7)!.range(local(2008, 11, 30, 0, 12), local(2009, 0, 8, 23, 48))).toEqual([local(2009, 0, 1), local(2009, 0, 8)])
  })
})
