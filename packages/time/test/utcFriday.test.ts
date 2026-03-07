import { describe, expect, it } from 'bun:test'
import { utcFriday, utcFridays } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcFriday', () => {
  it('utcFridays in an alias for utcFriday.range', () => { expect(utcFridays).toBe(utcFriday.range) })
  it('utcFriday.floor(date) returns Fridays', () => {
    expect(utcFriday.floor(utc(2011,  0,  5, 23, 59, 59))).toEqual(utc(2010, 11, 31))
    expect(utcFriday.floor(utc(2011,  0,  6,  0,  0,  0))).toEqual(utc(2010, 11, 31))
    expect(utcFriday.floor(utc(2011,  0,  6,  0,  0,  1))).toEqual(utc(2010, 11, 31))
    expect(utcFriday.floor(utc(2011,  0,  6, 23, 59, 59))).toEqual(utc(2010, 11, 31))
    expect(utcFriday.floor(utc(2011,  0,  7,  0,  0,  0))).toEqual(utc(2011,  0,  7))
    expect(utcFriday.floor(utc(2011,  0,  7,  0,  0,  1))).toEqual(utc(2011,  0,  7))
  })
  it('utcFriday.count(start, end) counts Fridays after start (exclusive) and before end (inclusive)', () => {
    expect(utcFriday.count!(utc(2012,  0,  1), utc(2012,  0,  5))).toBe(0)
    expect(utcFriday.count!(utc(2012,  0,  1), utc(2012,  0,  6))).toBe(1)
    expect(utcFriday.count!(utc(2012,  0,  1), utc(2012,  0,  7))).toBe(1)
    expect(utcFriday.count!(utc(2012,  0,  1), utc(2012,  0, 13))).toBe(2)
    expect(utcFriday.count!(utc(2010,  0,  1), utc(2010,  0,  7))).toBe(0)
    expect(utcFriday.count!(utc(2010,  0,  1), utc(2010,  0,  8))).toBe(1)
    expect(utcFriday.count!(utc(2010,  0,  1), utc(2010,  0,  9))).toBe(1)
  })
  it('utcFriday.count(start, end) does not observe daylight saving', () => {
    expect(utcFriday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(10)
    expect(utcFriday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(10)
    expect(utcFriday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(10)
    expect(utcFriday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(44)
    expect(utcFriday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(44)
    expect(utcFriday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(44)
  })
})
