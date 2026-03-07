import { describe, expect, it } from 'bun:test'
import { utcTuesday, utcTuesdays } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcTuesday', () => {
  it('utcTuesdays in an alias for utcTuesday.range', () => { expect(utcTuesdays).toBe(utcTuesday.range) })
  it('utcTuesday.floor(date) returns Tuesdays', () => {
    expect(utcTuesday.floor(utc(2011,  0,  2, 23, 59, 59))).toEqual(utc(2010, 11, 28))
    expect(utcTuesday.floor(utc(2011,  0,  3,  0,  0,  0))).toEqual(utc(2010, 11, 28))
    expect(utcTuesday.floor(utc(2011,  0,  3,  0,  0,  1))).toEqual(utc(2010, 11, 28))
    expect(utcTuesday.floor(utc(2011,  0,  3, 23, 59, 59))).toEqual(utc(2010, 11, 28))
    expect(utcTuesday.floor(utc(2011,  0,  4,  0,  0,  0))).toEqual(utc(2011,  0,  4))
    expect(utcTuesday.floor(utc(2011,  0,  4,  0,  0,  1))).toEqual(utc(2011,  0,  4))
  })
  it('utcTuesday.count(start, end) counts Tuesdays after start (exclusive) and before end (inclusive)', () => {
    expect(utcTuesday.count!(utc(2014,  0,  1), utc(2014,  0,  6))).toBe(0)
    expect(utcTuesday.count!(utc(2014,  0,  1), utc(2014,  0,  7))).toBe(1)
    expect(utcTuesday.count!(utc(2014,  0,  1), utc(2014,  0,  8))).toBe(1)
    expect(utcTuesday.count!(utc(2014,  0,  1), utc(2014,  0, 14))).toBe(2)
    expect(utcTuesday.count!(utc(2013,  0,  1), utc(2013,  0,  7))).toBe(0)
    expect(utcTuesday.count!(utc(2013,  0,  1), utc(2013,  0,  8))).toBe(1)
    expect(utcTuesday.count!(utc(2013,  0,  1), utc(2013,  0,  9))).toBe(1)
  })
  it('utcTuesday.count(start, end) does not observe daylight saving', () => {
    expect(utcTuesday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(10)
    expect(utcTuesday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(10)
    expect(utcTuesday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(10)
    expect(utcTuesday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(44)
    expect(utcTuesday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(44)
    expect(utcTuesday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(44)
  })
})
