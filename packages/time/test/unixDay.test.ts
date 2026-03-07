import { describe, expect, it } from 'bun:test'
import { unixDay, unixDays } from '../src/index.ts'
import { utc } from './date.ts'

describe('unixDay', () => {
  it('unixDays in an alias for unixDay.range', () => { expect(unixDays).toBe(unixDay.range) })
  it('unixDay.floor(date) returns days', () => {
    expect(unixDay.floor(utc(2010, 11, 31, 23))).toEqual(utc(2010, 11, 31))
    expect(unixDay.floor(utc(2011,  0,  1,  0))).toEqual(utc(2011,  0,  1))
    expect(unixDay.floor(utc(2011,  0,  1,  1))).toEqual(utc(2011,  0,  1))
  })
  it('unixDay.floor(date) does not observe daylight saving', () => {
    expect(unixDay.floor(utc(2011,  2, 13,  7))).toEqual(utc(2011,  2, 13))
    expect(unixDay.floor(utc(2011,  2, 13,  8))).toEqual(utc(2011,  2, 13))
    expect(unixDay.floor(utc(2011,  2, 13,  9))).toEqual(utc(2011,  2, 13))
    expect(unixDay.floor(utc(2011,  2, 13, 10))).toEqual(utc(2011,  2, 13))
    expect(unixDay.floor(utc(2011, 10,  6,  5))).toEqual(utc(2011, 10,  6))
    expect(unixDay.floor(utc(2011, 10,  6,  6))).toEqual(utc(2011, 10,  6))
    expect(unixDay.floor(utc(2011, 10,  6,  7))).toEqual(utc(2011, 10,  6))
    expect(unixDay.floor(utc(2011, 10,  6,  8))).toEqual(utc(2011, 10,  6))
  })
  it('unixDay.round(date) returns days', () => {
    expect(unixDay.round(utc(2010, 11, 30, 13))).toEqual(utc(2010, 11, 31))
    expect(unixDay.round(utc(2010, 11, 30, 11))).toEqual(utc(2010, 11, 30))
  })
  it('unixDay.ceil(date) returns days', () => {
    expect(unixDay.ceil(utc(2010, 11, 30, 23))).toEqual(utc(2010, 11, 31))
    expect(unixDay.ceil(utc(2010, 11, 31,  0))).toEqual(utc(2010, 11, 31))
    expect(unixDay.ceil(utc(2010, 11, 31,  1))).toEqual(utc(2011,  0,  1))
  })
  it('unixDay.ceil(date) does not observe daylight saving', () => {
    expect(unixDay.ceil(utc(2011,  2, 13,  7))).toEqual(utc(2011,  2, 14))
    expect(unixDay.ceil(utc(2011,  2, 13,  8))).toEqual(utc(2011,  2, 14))
    expect(unixDay.ceil(utc(2011,  2, 13,  9))).toEqual(utc(2011,  2, 14))
    expect(unixDay.ceil(utc(2011,  2, 13, 10))).toEqual(utc(2011,  2, 14))
    expect(unixDay.ceil(utc(2011, 10,  6,  5))).toEqual(utc(2011, 10,  7))
    expect(unixDay.ceil(utc(2011, 10,  6,  6))).toEqual(utc(2011, 10,  7))
    expect(unixDay.ceil(utc(2011, 10,  6,  7))).toEqual(utc(2011, 10,  7))
    expect(unixDay.ceil(utc(2011, 10,  6,  8))).toEqual(utc(2011, 10,  7))
  })
  it('unixDay.offset(date) is an alias for unixDay.offset(date, 1)', () => {
    expect(unixDay.offset(utc(2010, 11, 31, 23, 59, 59, 999))).toEqual(utc(2011,  0,  1, 23, 59, 59, 999))
  })
  it('unixDay.offset(date, step) does not modify the passed-in date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59, 999)
    unixDay.offset(d, +1)
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
  })
  it('unixDay.offset(date, step) does not round the passed-in date', () => {
    expect(unixDay.offset(utc(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(utc(2011,  0,  1, 23, 59, 59, 999))
    expect(unixDay.offset(utc(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(utc(2010, 11, 29, 23, 59, 59, 456))
  })
  it('unixDay.offset(date, step) allows step to be negative', () => {
    expect(unixDay.offset(utc(2010, 11, 31), -1)).toEqual(utc(2010, 11, 30))
    expect(unixDay.offset(utc(2011,  0,  1), -2)).toEqual(utc(2010, 11, 30))
    expect(unixDay.offset(utc(2011,  0,  1), -1)).toEqual(utc(2010, 11, 31))
  })
  it('unixDay.offset(date, step) allows step to be positive', () => {
    expect(unixDay.offset(utc(2010, 11, 31), +1)).toEqual(utc(2011,  0,  1))
    expect(unixDay.offset(utc(2010, 11, 30), +2)).toEqual(utc(2011,  0,  1))
    expect(unixDay.offset(utc(2010, 11, 30), +1)).toEqual(utc(2010, 11, 31))
  })
  it('unixDay.offset(date, step) allows step to be zero', () => {
    expect(unixDay.offset(utc(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
    expect(unixDay.offset(utc(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(utc(2010, 11, 31, 23, 59, 58,   0))
  })
  it('unixDay.count(start, end) counts days after start (exclusive) and before end (inclusive)', () => {
    expect(unixDay.count!(utc(2011,  0,  1,  0), utc(2011,  4,  9,  0))).toBe(128)
    expect(unixDay.count!(utc(2011,  0,  1,  1), utc(2011,  4,  9,  0))).toBe(128)
    expect(unixDay.count!(utc(2010, 11, 31, 23), utc(2011,  4,  9,  0))).toBe(129)
    expect(unixDay.count!(utc(2011,  0,  1,  0), utc(2011,  4,  8, 23))).toBe(127)
    expect(unixDay.count!(utc(2011,  0,  1,  0), utc(2011,  4,  9,  1))).toBe(128)
  })
  it('unixDay.count(start, end) does not observe daylight saving', () => {
    expect(unixDay.count!(utc(2011,  0,  1), utc(2011,  2, 13,  1))).toBe(71)
    expect(unixDay.count!(utc(2011,  0,  1), utc(2011,  2, 13,  3))).toBe(71)
    expect(unixDay.count!(utc(2011,  0,  1), utc(2011,  2, 13,  4))).toBe(71)
    expect(unixDay.count!(utc(2011,  0,  1), utc(2011, 10,  6,  0))).toBe(309)
    expect(unixDay.count!(utc(2011,  0,  1), utc(2011, 10,  6,  1))).toBe(309)
    expect(unixDay.count!(utc(2011,  0,  1), utc(2011, 10,  6,  2))).toBe(309)
  })
  it('unixDay.count(start, end) returns 364 or 365 for a full year', () => {
    expect(unixDay.count!(utc(1999,  0,  1), utc(1999, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2000,  0,  1), utc(2000, 11, 31))).toBe(365)
    expect(unixDay.count!(utc(2001,  0,  1), utc(2001, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2002,  0,  1), utc(2002, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2003,  0,  1), utc(2003, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2004,  0,  1), utc(2004, 11, 31))).toBe(365)
    expect(unixDay.count!(utc(2005,  0,  1), utc(2005, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2006,  0,  1), utc(2006, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2007,  0,  1), utc(2007, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2008,  0,  1), utc(2008, 11, 31))).toBe(365)
    expect(unixDay.count!(utc(2009,  0,  1), utc(2009, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2010,  0,  1), utc(2010, 11, 31))).toBe(364)
    expect(unixDay.count!(utc(2011,  0,  1), utc(2011, 11, 31))).toBe(364)
  })
  it('unixDay.every(step) returns every stepth day', () => {
    expect(unixDay.every!(3)!.range(utc(2008, 11, 30, 0, 12), utc(2009, 0, 5, 23, 48))).toEqual([utc(2008, 11, 31), utc(2009, 0, 3)])
    expect(unixDay.every!(5)!.range(utc(2008, 11, 30, 0, 12), utc(2009, 0, 6, 23, 48))).toEqual([utc(2009, 0, 1), utc(2009, 0, 6)])
    expect(unixDay.every!(7)!.range(utc(2008, 11, 30, 0, 12), utc(2009, 0, 8, 23, 48))).toEqual([utc(2009, 0, 1), utc(2009, 0, 8)])
  })
})
