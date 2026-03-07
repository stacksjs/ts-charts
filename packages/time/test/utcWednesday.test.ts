import { describe, expect, it } from 'bun:test'
import { utcWednesday, utcWednesdays } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcWednesday', () => {
  it('utcWednesdays in an alias for utcWednesday.range', () => { expect(utcWednesdays).toBe(utcWednesday.range) })
  it('utcWednesday.floor(date) returns Wednesdays', () => {
    expect(utcWednesday.floor(utc(2011,  0,  3, 23, 59, 59))).toEqual(utc(2010, 11, 29))
    expect(utcWednesday.floor(utc(2011,  0,  4,  0,  0,  0))).toEqual(utc(2010, 11, 29))
    expect(utcWednesday.floor(utc(2011,  0,  4,  0,  0,  1))).toEqual(utc(2010, 11, 29))
    expect(utcWednesday.floor(utc(2011,  0,  4, 23, 59, 59))).toEqual(utc(2010, 11, 29))
    expect(utcWednesday.floor(utc(2011,  0,  5,  0,  0,  0))).toEqual(utc(2011,  0,  5))
    expect(utcWednesday.floor(utc(2011,  0,  5,  0,  0,  1))).toEqual(utc(2011,  0,  5))
  })
  it('utcWednesday.count(start, end) counts Wednesdays after start (exclusive) and before end (inclusive)', () => {
    expect(utcWednesday.count!(utc(2012,  0,  1), utc(2012,  0,  3))).toBe(0)
    expect(utcWednesday.count!(utc(2012,  0,  1), utc(2012,  0,  4))).toBe(1)
    expect(utcWednesday.count!(utc(2012,  0,  1), utc(2012,  0,  5))).toBe(1)
    expect(utcWednesday.count!(utc(2012,  0,  1), utc(2012,  0, 11))).toBe(2)
    expect(utcWednesday.count!(utc(2014,  0,  1), utc(2014,  0,  7))).toBe(0)
    expect(utcWednesday.count!(utc(2014,  0,  1), utc(2014,  0,  8))).toBe(1)
    expect(utcWednesday.count!(utc(2014,  0,  1), utc(2014,  0,  9))).toBe(1)
  })
  it('utcWednesday.count(start, end) does not observe daylight saving', () => {
    expect(utcWednesday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(10)
    expect(utcWednesday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(10)
    expect(utcWednesday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(10)
    expect(utcWednesday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(44)
    expect(utcWednesday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(44)
    expect(utcWednesday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(44)
  })
})
