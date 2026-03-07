import { describe, expect, it } from 'bun:test'
import { utcSaturday, utcSaturdays } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcSaturday', () => {
  it('utcSaturdays in an alias for utcSaturday.range', () => { expect(utcSaturdays).toBe(utcSaturday.range) })
  it('utcSaturday.floor(date) returns Saturdays', () => {
    expect(utcSaturday.floor(utc(2011,  0,  6, 23, 59, 59))).toEqual(utc(2011,  0,  1))
    expect(utcSaturday.floor(utc(2011,  0,  7,  0,  0,  0))).toEqual(utc(2011,  0,  1))
    expect(utcSaturday.floor(utc(2011,  0,  7,  0,  0,  1))).toEqual(utc(2011,  0,  1))
    expect(utcSaturday.floor(utc(2011,  0,  7, 23, 59, 59))).toEqual(utc(2011,  0,  1))
    expect(utcSaturday.floor(utc(2011,  0,  8,  0,  0,  0))).toEqual(utc(2011,  0,  8))
    expect(utcSaturday.floor(utc(2011,  0,  8,  0,  0,  1))).toEqual(utc(2011,  0,  8))
  })
  it('utcSaturday.count(start, end) counts Saturdays after start (exclusive) and before end (inclusive)', () => {
    expect(utcSaturday.count!(utc(2012,  0,  1), utc(2012,  0,  6))).toBe(0)
    expect(utcSaturday.count!(utc(2012,  0,  1), utc(2012,  0,  7))).toBe(1)
    expect(utcSaturday.count!(utc(2012,  0,  1), utc(2012,  0,  8))).toBe(1)
    expect(utcSaturday.count!(utc(2012,  0,  1), utc(2012,  0, 14))).toBe(2)
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011,  0,  7))).toBe(0)
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011,  0,  8))).toBe(1)
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011,  0,  9))).toBe(1)
  })
  it('utcSaturday.count(start, end) does not observe daylight saving', () => {
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(10)
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(10)
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(10)
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(44)
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(44)
    expect(utcSaturday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(44)
  })
})
