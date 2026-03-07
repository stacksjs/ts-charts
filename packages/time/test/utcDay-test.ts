import { describe, expect, it } from 'bun:test'
import { utcDay, utcDays } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcDay', () => {
  it('utcDays in an alias for utcDay.range', () => { expect(utcDays).toBe(utcDay.range) })
  it('utcDay.floor(date) returns days', () => {
    expect(utcDay.floor(utc(2010, 11, 31, 23))).toEqual(utc(2010, 11, 31))
    expect(utcDay.floor(utc(2011,  0,  1,  0))).toEqual(utc(2011,  0,  1))
    expect(utcDay.floor(utc(2011,  0,  1,  1))).toEqual(utc(2011,  0,  1))
  })
  it('utcDay.floor(date) does not observe daylight saving', () => {
    expect(utcDay.floor(utc(2011,  2, 13,  7))).toEqual(utc(2011,  2, 13))
    expect(utcDay.floor(utc(2011,  2, 13,  8))).toEqual(utc(2011,  2, 13))
    expect(utcDay.floor(utc(2011,  2, 13,  9))).toEqual(utc(2011,  2, 13))
    expect(utcDay.floor(utc(2011,  2, 13, 10))).toEqual(utc(2011,  2, 13))
    expect(utcDay.floor(utc(2011, 10,  6,  5))).toEqual(utc(2011, 10,  6))
    expect(utcDay.floor(utc(2011, 10,  6,  6))).toEqual(utc(2011, 10,  6))
    expect(utcDay.floor(utc(2011, 10,  6,  7))).toEqual(utc(2011, 10,  6))
    expect(utcDay.floor(utc(2011, 10,  6,  8))).toEqual(utc(2011, 10,  6))
  })
  it('utcDay.round(date) returns days', () => {
    expect(utcDay.round(utc(2010, 11, 30, 13))).toEqual(utc(2010, 11, 31))
    expect(utcDay.round(utc(2010, 11, 30, 11))).toEqual(utc(2010, 11, 30))
  })
  it('utcDay.ceil(date) returns days', () => {
    expect(utcDay.ceil(utc(2010, 11, 30, 23))).toEqual(utc(2010, 11, 31))
    expect(utcDay.ceil(utc(2010, 11, 31,  0))).toEqual(utc(2010, 11, 31))
    expect(utcDay.ceil(utc(2010, 11, 31,  1))).toEqual(utc(2011,  0,  1))
  })
  it('utcDay.ceil(date) does not observe daylight saving', () => {
    expect(utcDay.ceil(utc(2011,  2, 13,  7))).toEqual(utc(2011,  2, 14))
    expect(utcDay.ceil(utc(2011,  2, 13,  8))).toEqual(utc(2011,  2, 14))
    expect(utcDay.ceil(utc(2011,  2, 13,  9))).toEqual(utc(2011,  2, 14))
    expect(utcDay.ceil(utc(2011,  2, 13, 10))).toEqual(utc(2011,  2, 14))
    expect(utcDay.ceil(utc(2011, 10,  6,  5))).toEqual(utc(2011, 10,  7))
    expect(utcDay.ceil(utc(2011, 10,  6,  6))).toEqual(utc(2011, 10,  7))
    expect(utcDay.ceil(utc(2011, 10,  6,  7))).toEqual(utc(2011, 10,  7))
    expect(utcDay.ceil(utc(2011, 10,  6,  8))).toEqual(utc(2011, 10,  7))
  })
  it('utcDay.offset(date) is an alias for utcDay.offset(date, 1)', () => {
    expect(utcDay.offset(utc(2010, 11, 31, 23, 59, 59, 999))).toEqual(utc(2011,  0,  1, 23, 59, 59, 999))
  })
  it('utcDay.offset(date, step) does not modify the passed-in date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59, 999)
    utcDay.offset(d, +1)
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
  })
  it('utcDay.offset(date, step) does not round the passed-in date', () => {
    expect(utcDay.offset(utc(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(utc(2011,  0,  1, 23, 59, 59, 999))
    expect(utcDay.offset(utc(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(utc(2010, 11, 29, 23, 59, 59, 456))
  })
  it('utcDay.offset(date, step) allows step to be negative', () => {
    expect(utcDay.offset(utc(2010, 11, 31), -1)).toEqual(utc(2010, 11, 30))
    expect(utcDay.offset(utc(2011,  0,  1), -2)).toEqual(utc(2010, 11, 30))
    expect(utcDay.offset(utc(2011,  0,  1), -1)).toEqual(utc(2010, 11, 31))
  })
  it('utcDay.offset(date, step) allows step to be positive', () => {
    expect(utcDay.offset(utc(2010, 11, 31), +1)).toEqual(utc(2011,  0,  1))
    expect(utcDay.offset(utc(2010, 11, 30), +2)).toEqual(utc(2011,  0,  1))
    expect(utcDay.offset(utc(2010, 11, 30), +1)).toEqual(utc(2010, 11, 31))
  })
  it('utcDay.offset(date, step) allows step to be zero', () => {
    expect(utcDay.offset(utc(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
    expect(utcDay.offset(utc(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(utc(2010, 11, 31, 23, 59, 58,   0))
  })
  it('utcDay.count(start, end) counts days after start (exclusive) and before end (inclusive)', () => {
    expect(utcDay.count!(utc(2011,  0,  1,  0), utc(2011,  4,  9,  0))).toBe(128)
    expect(utcDay.count!(utc(2011,  0,  1,  1), utc(2011,  4,  9,  0))).toBe(128)
    expect(utcDay.count!(utc(2010, 11, 31, 23), utc(2011,  4,  9,  0))).toBe(129)
    expect(utcDay.count!(utc(2011,  0,  1,  0), utc(2011,  4,  8, 23))).toBe(127)
    expect(utcDay.count!(utc(2011,  0,  1,  0), utc(2011,  4,  9,  1))).toBe(128)
  })
  it('utcDay.count(start, end) does not observe daylight saving', () => {
    expect(utcDay.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(71)
    expect(utcDay.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(71)
    expect(utcDay.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(71)
    expect(utcDay.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(309)
    expect(utcDay.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(309)
    expect(utcDay.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(309)
  })
  it('utcDay.count(start, end) returns 364 or 365 for a full year', () => {
    expect(utcDay.count!(utc(1999,  0,  1), utc(1999, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2000,  0,  1), utc(2000, 11, 31))).toBe(365)
    expect(utcDay.count!(utc(2001,  0,  1), utc(2001, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2002,  0,  1), utc(2002, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2003,  0,  1), utc(2003, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2004,  0,  1), utc(2004, 11, 31))).toBe(365)
    expect(utcDay.count!(utc(2005,  0,  1), utc(2005, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2006,  0,  1), utc(2006, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2007,  0,  1), utc(2007, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2008,  0,  1), utc(2008, 11, 31))).toBe(365)
    expect(utcDay.count!(utc(2009,  0,  1), utc(2009, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2010,  0,  1), utc(2010, 11, 31))).toBe(364)
    expect(utcDay.count!(utc(2011,  0,  1), utc(2011, 11, 31))).toBe(364)
  })
  it('utcDay.every(step) returns every stepth day, starting with the first day of the month', () => {
    expect(utcDay.every!(3)!.range(utc(2008, 11, 30, 0, 12), utc(2009, 0, 5, 23, 48))).toEqual([utc(2008, 11, 31), utc(2009, 0, 1), utc(2009, 0, 4)])
    expect(utcDay.every!(5)!.range(utc(2008, 11, 30, 0, 12), utc(2009, 0, 6, 23, 48))).toEqual([utc(2008, 11, 31), utc(2009, 0, 1), utc(2009, 0, 6)])
    expect(utcDay.every!(7)!.range(utc(2008, 11, 30, 0, 12), utc(2009, 0, 8, 23, 48))).toEqual([utc(2009, 0, 1), utc(2009, 0, 8)])
  })
})
