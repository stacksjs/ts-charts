import { describe, expect, it } from 'bun:test'
import { timeSunday, timeSundays } from '../src/index.ts'
import { local } from './date.ts'

describe('timeSunday', () => {
  it('timeSundays in an alias for timeSunday.range', () => {
    expect(timeSundays).toBe(timeSunday.range)
  })

  it('timeSunday.floor(date) returns Sundays', () => {
    expect(timeSunday.floor(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2010, 11, 26))
    expect(timeSunday.floor(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2010, 11, 26))
    expect(timeSunday.floor(local(2011,  0,  1,  0,  0,  1))).toEqual(local(2010, 11, 26))
    expect(timeSunday.floor(local(2011,  0,  1, 23, 59, 59))).toEqual(local(2010, 11, 26))
    expect(timeSunday.floor(local(2011,  0,  2,  0,  0,  0))).toEqual(local(2011,  0,  2))
    expect(timeSunday.floor(local(2011,  0,  2,  0,  0,  1))).toEqual(local(2011,  0,  2))
  })

  it('timeSunday.floor(date) observes daylight saving', () => {
    expect(timeSunday.floor(local(2011,  2, 13,  1))).toEqual(local(2011,  2, 13))
    expect(timeSunday.floor(local(2011, 10,  6,  1))).toEqual(local(2011, 10,  6))
  })

  it('timeSunday.floor(date) handles years in the first century', () => {
    expect(timeSunday.floor(local(9, 10,  6,  7))).toEqual(local(9, 10,  1))
  })

  it('timeSunday.ceil(date) returns Sundays', () => {
    expect(timeSunday.ceil(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2011,  0,  2))
    expect(timeSunday.ceil(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2011,  0,  2))
    expect(timeSunday.ceil(local(2011,  0,  1,  0,  0,  1))).toEqual(local(2011,  0,  2))
    expect(timeSunday.ceil(local(2011,  0,  1, 23, 59, 59))).toEqual(local(2011,  0,  2))
    expect(timeSunday.ceil(local(2011,  0,  2,  0,  0,  0))).toEqual(local(2011,  0,  2))
    expect(timeSunday.ceil(local(2011,  0,  2,  0,  0,  1))).toEqual(local(2011,  0,  9))
  })

  it('timeSunday.ceil(date) observes daylight saving', () => {
    expect(timeSunday.ceil(local(2011,  2, 13,  1))).toEqual(local(2011,  2, 20))
    expect(timeSunday.ceil(local(2011, 10,  6,  1))).toEqual(local(2011, 10, 13))
  })

  it('timeSunday.offset(date) is an alias for timeSunday.offset(date, 1)', () => {
    expect(timeSunday.offset(local(2010, 11, 31, 23, 59, 59, 999))).toEqual(local(2011,  0,  7, 23, 59, 59, 999))
  })

  it('timeSunday.offset(date, step) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeSunday.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })

  it('timeSunday.offset(date, step) does not round the passed-in date', () => {
    expect(timeSunday.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011,  0,  7, 23, 59, 59, 999))
    expect(timeSunday.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2010, 11, 17, 23, 59, 59, 456))
  })

  it('timeSunday.offset(date, step) allows step to be negative', () => {
    expect(timeSunday.offset(local(2010, 11,  1), -1)).toEqual(local(2010, 10, 24))
    expect(timeSunday.offset(local(2011,  0,  1), -2)).toEqual(local(2010, 11, 18))
    expect(timeSunday.offset(local(2011,  0,  1), -1)).toEqual(local(2010, 11, 25))
  })

  it('timeSunday.offset(date, step) allows step to be positive', () => {
    expect(timeSunday.offset(local(2010, 10, 24), +1)).toEqual(local(2010, 11,  1))
    expect(timeSunday.offset(local(2010, 11, 18), +2)).toEqual(local(2011,  0,  1))
    expect(timeSunday.offset(local(2010, 11, 25), +1)).toEqual(local(2011,  0,  1))
  })

  it('timeSunday.offset(date, step) allows step to be zero', () => {
    expect(timeSunday.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeSunday.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })

  it('timeSunday.range(start, stop) returns Sundays between start (inclusive) and stop (exclusive)', () => {
    expect(timeSunday.range(local(2011, 11,  1), local(2012,  0, 15))).toEqual([
      local(2011, 11,  4), local(2011, 11, 11), local(2011, 11, 18),
      local(2011, 11, 25), local(2012,  0,  1), local(2012,  0,  8),
    ])
  })

  it('timeSunday.range(start, stop) returns Sundays', () => {
    expect(timeSunday.range(local(2011, 11,  1, 12, 23), local(2012,  0, 14, 12, 23))).toEqual([
      local(2011, 11,  4), local(2011, 11, 11), local(2011, 11, 18),
      local(2011, 11, 25), local(2012,  0,  1), local(2012,  0,  8),
    ])
  })

  it('timeSunday.range(start, stop) coerces start and stop to dates', () => {
    expect(timeSunday.range(+local(2011, 11,  1), +local(2012,  0, 15))).toEqual([
      local(2011, 11,  4), local(2011, 11, 11), local(2011, 11, 18),
      local(2011, 11, 25), local(2012,  0,  1), local(2012,  0,  8),
    ])
  })

  it('timeSunday.range(start, stop) returns the empty array for invalid dates', () => {
    expect(timeSunday.range(new Date(NaN), Infinity)).toEqual([])
  })

  it('timeSunday.range(start, stop) returns the empty array if start >= stop', () => {
    expect(timeSunday.range(local(2011, 11, 10), local(2011, 10,  4))).toEqual([])
    expect(timeSunday.range(local(2011, 10,  1), local(2011, 10,  1))).toEqual([])
  })

  it('timeSunday.range(start, stop, step) returns every step Sunday', () => {
    expect(timeSunday.range(local(2011, 11,  1), local(2012,  0, 15), 2)).toEqual([
      local(2011, 11,  4), local(2011, 11, 18), local(2012,  0,  1),
    ])
  })

  it('timeSunday.count(start, end) counts Sundays after start (exclusive) and before end (inclusive)', () => {
    expect(timeSunday.count!(local(2014,  0,  1), local(2014,  0,  4))).toBe(0)
    expect(timeSunday.count!(local(2014,  0,  1), local(2014,  0,  5))).toBe(1)
    expect(timeSunday.count!(local(2014,  0,  1), local(2014,  0,  6))).toBe(1)
    expect(timeSunday.count!(local(2014,  0,  1), local(2014,  0, 12))).toBe(2)
    expect(timeSunday.count!(local(2012,  0,  1), local(2012,  0,  7))).toBe(0)
    expect(timeSunday.count!(local(2012,  0,  1), local(2012,  0,  8))).toBe(1)
    expect(timeSunday.count!(local(2012,  0,  1), local(2012,  0,  9))).toBe(1)
  })

  it('timeSunday.count(start, end) observes daylight saving', () => {
    expect(timeSunday.count!(local(2011,  0,  1), local(2011,  2, 13,  1))).toBe(11)
    expect(timeSunday.count!(local(2011,  0,  1), local(2011,  2, 13,  3))).toBe(11)
    expect(timeSunday.count!(local(2011,  0,  1), local(2011,  2, 13,  4))).toBe(11)
    expect(timeSunday.count!(local(2011,  0,  1), local(2011, 10,  6,  0))).toBe(45)
    expect(timeSunday.count!(local(2011,  0,  1), local(2011, 10,  6,  1))).toBe(45)
    expect(timeSunday.count!(local(2011,  0,  1), local(2011, 10,  6,  2))).toBe(45)
  })
})
