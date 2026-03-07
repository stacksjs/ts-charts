import { describe, expect, it } from 'bun:test'
import { utcThursday, utcThursdays } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcThursday', () => {
  it('utcThursdays in an alias for utcThursday.range', () => { expect(utcThursdays).toBe(utcThursday.range) })
  it('utcThursday.floor(date) returns Thursdays', () => {
    expect(utcThursday.floor(utc(2011,  0,  4, 23, 59, 59))).toEqual(utc(2010, 11, 30))
    expect(utcThursday.floor(utc(2011,  0,  5,  0,  0,  0))).toEqual(utc(2010, 11, 30))
    expect(utcThursday.floor(utc(2011,  0,  5,  0,  0,  1))).toEqual(utc(2010, 11, 30))
    expect(utcThursday.floor(utc(2011,  0,  5, 23, 59, 59))).toEqual(utc(2010, 11, 30))
    expect(utcThursday.floor(utc(2011,  0,  6,  0,  0,  0))).toEqual(utc(2011,  0,  6))
    expect(utcThursday.floor(utc(2011,  0,  6,  0,  0,  1))).toEqual(utc(2011,  0,  6))
  })
  it('utcThursday.count(start, end) counts Thursdays after start (exclusive) and before end (inclusive)', () => {
    expect(utcThursday.count!(utc(2012,  0,  1), utc(2012,  0,  4))).toBe(0)
    expect(utcThursday.count!(utc(2012,  0,  1), utc(2012,  0,  5))).toBe(1)
    expect(utcThursday.count!(utc(2012,  0,  1), utc(2012,  0,  6))).toBe(1)
    expect(utcThursday.count!(utc(2012,  0,  1), utc(2012,  0, 12))).toBe(2)
    expect(utcThursday.count!(utc(2015,  0,  1), utc(2015,  0,  7))).toBe(0)
    expect(utcThursday.count!(utc(2015,  0,  1), utc(2015,  0,  8))).toBe(1)
    expect(utcThursday.count!(utc(2015,  0,  1), utc(2015,  0,  9))).toBe(1)
  })
  it('utcThursday.count(start, end) does not observe daylight saving', () => {
    expect(utcThursday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(10)
    expect(utcThursday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(10)
    expect(utcThursday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(10)
    expect(utcThursday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(44)
    expect(utcThursday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(44)
    expect(utcThursday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(44)
  })
})
