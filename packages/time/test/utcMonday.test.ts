import { describe, expect, it } from 'bun:test'
import { utcMonday, utcMondays } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcMonday', () => {
  it('utcMondays in an alias for utcMonday.range', () => { expect(utcMondays).toBe(utcMonday.range) })
  it('utcMonday.floor(date) returns Mondays', () => {
    expect(utcMonday.floor(utc(2011,  0,  1, 23, 59, 59))).toEqual(utc(2010, 11, 27))
    expect(utcMonday.floor(utc(2011,  0,  2,  0,  0,  0))).toEqual(utc(2010, 11, 27))
    expect(utcMonday.floor(utc(2011,  0,  2,  0,  0,  1))).toEqual(utc(2010, 11, 27))
    expect(utcMonday.floor(utc(2011,  0,  2, 23, 59, 59))).toEqual(utc(2010, 11, 27))
    expect(utcMonday.floor(utc(2011,  0,  3,  0,  0,  0))).toEqual(utc(2011,  0,  3))
    expect(utcMonday.floor(utc(2011,  0,  3,  0,  0,  1))).toEqual(utc(2011,  0,  3))
  })
  it('utcMonday.range(start, stop, step) returns every step Monday', () => {
    expect(utcMonday.range(utc(2011, 11,  1), utc(2012,  0, 15), 2)).toEqual([
      utc(2011, 11,  5),
      utc(2011, 11, 19),
      utc(2012,  0,  2),
    ])
  })
  it('utcMonday.count(start, end) counts Mondays after start (exclusive) and before end (inclusive)', () => {
    expect(utcMonday.count!(utc(2014,  0,  1), utc(2014,  0,  5))).toBe(0)
    expect(utcMonday.count!(utc(2014,  0,  1), utc(2014,  0,  6))).toBe(1)
    expect(utcMonday.count!(utc(2014,  0,  1), utc(2014,  0,  7))).toBe(1)
    expect(utcMonday.count!(utc(2014,  0,  1), utc(2014,  0, 13))).toBe(2)
    expect(utcMonday.count!(utc(2018,  0,  1), utc(2018,  0,  7))).toBe(0)
    expect(utcMonday.count!(utc(2018,  0,  1), utc(2018,  0,  8))).toBe(1)
    expect(utcMonday.count!(utc(2018,  0,  1), utc(2018,  0,  9))).toBe(1)
  })
  it('utcMonday.count(start, end) does not observe daylight saving', () => {
    expect(utcMonday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(10)
    expect(utcMonday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(10)
    expect(utcMonday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(10)
    expect(utcMonday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(44)
    expect(utcMonday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(44)
    expect(utcMonday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(44)
  })
})
