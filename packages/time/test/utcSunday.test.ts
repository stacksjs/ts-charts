import { describe, expect, it } from 'bun:test'
import { utcSunday, utcSundays } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcSunday', () => {
  it('utcSundays in an alias for utcSunday.range', () => { expect(utcSundays).toBe(utcSunday.range) })
  it('utcSunday.floor(date) returns Sundays', () => {
    expect(utcSunday.floor(utc(2010, 11, 31, 23, 59, 59))).toEqual(utc(2010, 11, 26))
    expect(utcSunday.floor(utc(2011,  0,  1,  0,  0,  0))).toEqual(utc(2010, 11, 26))
    expect(utcSunday.floor(utc(2011,  0,  1,  0,  0,  1))).toEqual(utc(2010, 11, 26))
    expect(utcSunday.floor(utc(2011,  0,  1, 23, 59, 59))).toEqual(utc(2010, 11, 26))
    expect(utcSunday.floor(utc(2011,  0,  2,  0,  0,  0))).toEqual(utc(2011,  0,  2))
    expect(utcSunday.floor(utc(2011,  0,  2,  0,  0,  1))).toEqual(utc(2011,  0,  2))
  })
  it('utcSunday.floor(date) observes daylight saving', () => {
    expect(utcSunday.floor(utc(2011,  2, 13,  1))).toEqual(utc(2011,  2, 13))
    expect(utcSunday.floor(utc(2011, 10,  6,  1))).toEqual(utc(2011, 10,  6))
  })
  it('utcSunday.floor(date) handles years in the first century', () => {
    expect(utcSunday.floor(utc(9, 10,  6,  7))).toEqual(utc(9, 10,  1))
  })
  it('utcSunday.ceil(date) returns Sundays', () => {
    expect(utcSunday.ceil(utc(2010, 11, 31, 23, 59, 59))).toEqual(utc(2011,  0,  2))
    expect(utcSunday.ceil(utc(2011,  0,  1,  0,  0,  0))).toEqual(utc(2011,  0,  2))
    expect(utcSunday.ceil(utc(2011,  0,  1,  0,  0,  1))).toEqual(utc(2011,  0,  2))
    expect(utcSunday.ceil(utc(2011,  0,  1, 23, 59, 59))).toEqual(utc(2011,  0,  2))
    expect(utcSunday.ceil(utc(2011,  0,  2,  0,  0,  0))).toEqual(utc(2011,  0,  2))
    expect(utcSunday.ceil(utc(2011,  0,  2,  0,  0,  1))).toEqual(utc(2011,  0,  9))
  })
  it('utcSunday.ceil(date) observes daylight saving', () => {
    expect(utcSunday.ceil(utc(2011,  2, 13,  1))).toEqual(utc(2011,  2, 20))
    expect(utcSunday.ceil(utc(2011, 10,  6,  1))).toEqual(utc(2011, 10, 13))
  })
  it('utcSunday.offset(date) is an alias for utcSunday.offset(date, 1)', () => {
    expect(utcSunday.offset(utc(2010, 11, 31, 23, 59, 59, 999))).toEqual(utc(2011,  0,  7, 23, 59, 59, 999))
  })
  it('utcSunday.offset(date, step) does not modify the passed-in date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59, 999)
    utcSunday.offset(d, +1)
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
  })
  it('utcSunday.offset(date, step) does not round the passed-in date', () => {
    expect(utcSunday.offset(utc(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(utc(2011,  0,  7, 23, 59, 59, 999))
    expect(utcSunday.offset(utc(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(utc(2010, 11, 17, 23, 59, 59, 456))
  })
  it('utcSunday.offset(date, step) allows step to be negative', () => {
    expect(utcSunday.offset(utc(2010, 11,  1), -1)).toEqual(utc(2010, 10, 24))
    expect(utcSunday.offset(utc(2011,  0,  1), -2)).toEqual(utc(2010, 11, 18))
    expect(utcSunday.offset(utc(2011,  0,  1), -1)).toEqual(utc(2010, 11, 25))
  })
  it('utcSunday.offset(date, step) allows step to be positive', () => {
    expect(utcSunday.offset(utc(2010, 10, 24), +1)).toEqual(utc(2010, 11,  1))
    expect(utcSunday.offset(utc(2010, 11, 18), +2)).toEqual(utc(2011,  0,  1))
    expect(utcSunday.offset(utc(2010, 11, 25), +1)).toEqual(utc(2011,  0,  1))
  })
  it('utcSunday.offset(date, step) allows step to be zero', () => {
    expect(utcSunday.offset(utc(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
    expect(utcSunday.offset(utc(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(utc(2010, 11, 31, 23, 59, 58,   0))
  })
  it('utcSunday.range(start, stop) returns Sundays between start (inclusive) and stop (exclusive)', () => {
    expect(utcSunday.range(utc(2011, 11,  1), utc(2012,  0, 15))).toEqual([
      utc(2011, 11,  4),
      utc(2011, 11, 11),
      utc(2011, 11, 18),
      utc(2011, 11, 25),
      utc(2012,  0,  1),
      utc(2012,  0,  8),
    ])
  })
  it('utcSunday.range(start, stop) returns Sundays', () => {
    expect(utcSunday.range(utc(2011, 11,  1, 12, 23), utc(2012,  0, 14, 12, 23))).toEqual([
      utc(2011, 11,  4),
      utc(2011, 11, 11),
      utc(2011, 11, 18),
      utc(2011, 11, 25),
      utc(2012,  0,  1),
      utc(2012,  0,  8),
    ])
  })
  it('utcSunday.range(start, stop) coerces start and stop to dates', () => {
    expect(utcSunday.range(+utc(2011, 11,  1), +utc(2012,  0, 15))).toEqual([
      utc(2011, 11,  4),
      utc(2011, 11, 11),
      utc(2011, 11, 18),
      utc(2011, 11, 25),
      utc(2012,  0,  1),
      utc(2012,  0,  8),
    ])
  })
  it('utcSunday.range(start, stop) returns the empty array for invalid dates', () => {
    expect(utcSunday.range(new Date(NaN), Infinity)).toEqual([])
  })
  it('utcSunday.range(start, stop) returns the empty array if start >= stop', () => {
    expect(utcSunday.range(utc(2011, 11, 10), utc(2011, 10,  4))).toEqual([])
    expect(utcSunday.range(utc(2011, 10,  1), utc(2011, 10,  1))).toEqual([])
  })
  it('utcSunday.range(start, stop, step) returns every step Sunday', () => {
    expect(utcSunday.range(utc(2011, 11,  1), utc(2012,  0, 15), 2)).toEqual([
      utc(2011, 11,  4),
      utc(2011, 11, 18),
      utc(2012,  0,  1),
    ])
  })
  it('utcSunday.count(start, end) counts Sundays after start (exclusive) and before end (inclusive)', () => {
    expect(utcSunday.count!(utc(2014,  0,  1), utc(2014,  0,  4))).toBe(0)
    expect(utcSunday.count!(utc(2014,  0,  1), utc(2014,  0,  5))).toBe(1)
    expect(utcSunday.count!(utc(2014,  0,  1), utc(2014,  0,  6))).toBe(1)
    expect(utcSunday.count!(utc(2014,  0,  1), utc(2014,  0, 12))).toBe(2)
    expect(utcSunday.count!(utc(2012,  0,  1), utc(2012,  0,  7))).toBe(0)
    expect(utcSunday.count!(utc(2012,  0,  1), utc(2012,  0,  8))).toBe(1)
    expect(utcSunday.count!(utc(2012,  0,  1), utc(2012,  0,  9))).toBe(1)
  })
  it('utcSunday.count(start, end) does not observe daylight saving', () => {
    expect(utcSunday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(11)
    expect(utcSunday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(11)
    expect(utcSunday.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(11)
    expect(utcSunday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(45)
    expect(utcSunday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(45)
    expect(utcSunday.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(45)
  })
})
