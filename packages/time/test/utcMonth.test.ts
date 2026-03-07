import { describe, expect, it } from 'bun:test'
import { utcMonth, utcMonths } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcMonth', () => {
  it('utcMonths in an alias for utcMonth.range', () => { expect(utcMonths).toBe(utcMonth.range) })
  it('utcMonth.floor(date) returns months', () => {
    expect(utcMonth.floor(utc(2010, 11, 31, 23))).toEqual(utc(2010, 11,  1))
    expect(utcMonth.floor(utc(2011,  0,  1,  0))).toEqual(utc(2011,  0,  1))
    expect(utcMonth.floor(utc(2011,  0,  1,  1))).toEqual(utc(2011,  0,  1))
  })
  it('utcMonth.floor(date) observes daylight saving', () => {
    expect(utcMonth.floor(utc(2011,  2, 13,  7))).toEqual(utc(2011,  2,  1))
    expect(utcMonth.floor(utc(2011,  2, 13,  8))).toEqual(utc(2011,  2,  1))
    expect(utcMonth.floor(utc(2011,  2, 13,  9))).toEqual(utc(2011,  2,  1))
    expect(utcMonth.floor(utc(2011,  2, 13, 10))).toEqual(utc(2011,  2,  1))
    expect(utcMonth.floor(utc(2011, 10,  6,  7))).toEqual(utc(2011, 10,  1))
    expect(utcMonth.floor(utc(2011, 10,  6,  8))).toEqual(utc(2011, 10,  1))
    expect(utcMonth.floor(utc(2011, 10,  6,  9))).toEqual(utc(2011, 10,  1))
    expect(utcMonth.floor(utc(2011, 10,  6, 10))).toEqual(utc(2011, 10,  1))
  })
  it('utcMonth.floor(date) handles years in the first century', () => {
    expect(utcMonth.floor(utc(9, 10,  6,  7))).toEqual(utc(9, 10,  1))
  })
  it('utcMonth.round(date) returns months', () => {
    expect(utcMonth.round(utc(2010, 11, 16, 12))).toEqual(utc(2011,  0,  1))
    expect(utcMonth.round(utc(2010, 11, 16, 11))).toEqual(utc(2010, 11,  1))
  })
  it('utcMonth.round(date) observes daylight saving', () => {
    expect(utcMonth.round(utc(2011,  2, 13,  7))).toEqual(utc(2011,  2,  1))
    expect(utcMonth.round(utc(2011,  2, 13,  8))).toEqual(utc(2011,  2,  1))
    expect(utcMonth.round(utc(2011,  2, 13,  9))).toEqual(utc(2011,  2,  1))
    expect(utcMonth.round(utc(2011,  2, 13, 20))).toEqual(utc(2011,  2,  1))
    expect(utcMonth.round(utc(2011, 10,  6,  7))).toEqual(utc(2011, 10,  1))
    expect(utcMonth.round(utc(2011, 10,  6,  8))).toEqual(utc(2011, 10,  1))
    expect(utcMonth.round(utc(2011, 10,  6,  9))).toEqual(utc(2011, 10,  1))
    expect(utcMonth.round(utc(2011, 10,  6, 20))).toEqual(utc(2011, 10,  1))
  })
  it('utcMonth.round(date) handles midnight for leap years', () => {
    expect(utcMonth.round(utc(2012,  2,  1,  0))).toEqual(utc(2012,  2,  1))
    expect(utcMonth.round(utc(2012,  2,  1,  0))).toEqual(utc(2012,  2,  1))
  })
  it('utcMonth.ceil(date) returns months', () => {
    expect(utcMonth.ceil(utc(2010, 10, 30, 23))).toEqual(utc(2010, 11,  1))
    expect(utcMonth.ceil(utc(2010, 11,  1,  1))).toEqual(utc(2011,  0,  1))
  })
  it('utcMonth.ceil(date) observes daylight saving', () => {
    expect(utcMonth.ceil(utc(2011,  2, 13,  7))).toEqual(utc(2011,  3,  1))
    expect(utcMonth.ceil(utc(2011,  2, 13,  8))).toEqual(utc(2011,  3,  1))
    expect(utcMonth.ceil(utc(2011,  2, 13,  9))).toEqual(utc(2011,  3,  1))
    expect(utcMonth.ceil(utc(2011,  2, 13, 10))).toEqual(utc(2011,  3,  1))
    expect(utcMonth.ceil(utc(2011, 10,  6,  7))).toEqual(utc(2011, 11,  1))
    expect(utcMonth.ceil(utc(2011, 10,  6,  8))).toEqual(utc(2011, 11,  1))
    expect(utcMonth.ceil(utc(2011, 10,  6,  9))).toEqual(utc(2011, 11,  1))
    expect(utcMonth.ceil(utc(2011, 10,  6, 10))).toEqual(utc(2011, 11,  1))
  })
  it('utcMonth.ceil(date) handles midnight for leap years', () => {
    expect(utcMonth.ceil(utc(2012,  2,  1,  0))).toEqual(utc(2012,  2,  1))
    expect(utcMonth.ceil(utc(2012,  2,  1,  0))).toEqual(utc(2012,  2,  1))
  })
  it('utcMonth.offset(date) is an alias for utcMonth.offset(date, 1)', () => {
    expect(utcMonth.offset(utc(2010, 11, 31, 23, 59, 59, 999))).toEqual(utc(2011,  0, 31, 23, 59, 59, 999))
  })
  it('utcMonth.offset(date, step) does not modify the passed-in date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59, 999)
    utcMonth.offset(d, +1)
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
  })
  it('utcMonth.offset(date, step) does not round the passed-in date', () => {
    expect(utcMonth.offset(utc(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(utc(2011,  0, 31, 23, 59, 59, 999))
    expect(utcMonth.offset(utc(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(utc(2010,  9, 31, 23, 59, 59, 456))
  })
  it('utcMonth.offset(date, step) allows step to be negative', () => {
    expect(utcMonth.offset(utc(2010, 11, 31), -1)).toEqual(utc(2010, 10, 31))
    expect(utcMonth.offset(utc(2011,  0,  1), -2)).toEqual(utc(2010, 10,  1))
    expect(utcMonth.offset(utc(2011,  0,  1), -1)).toEqual(utc(2010, 11,  1))
  })
  it('utcMonth.offset(date, step) allows step to be positive', () => {
    expect(utcMonth.offset(utc(2010, 11, 31), +1)).toEqual(utc(2011,  0, 31))
    expect(utcMonth.offset(utc(2010, 11, 30), +2)).toEqual(utc(2011,  1, 30))
    expect(utcMonth.offset(utc(2010, 11, 30), +1)).toEqual(utc(2011,  0, 30))
  })
  it('utcMonth.offset(date, step) allows step to be zero', () => {
    expect(utcMonth.offset(utc(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
    expect(utcMonth.offset(utc(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(utc(2010, 11, 31, 23, 59, 58,   0))
  })
  it('utcMonth.range(start, stop) returns months between start (inclusive) and stop (exclusive)', () => {
    expect(utcMonth.range(utc(2011, 11,  1), utc(2012,  5,  1))).toEqual([
      utc(2011, 11,  1),
      utc(2012,  0,  1),
      utc(2012,  1,  1),
      utc(2012,  2,  1),
      utc(2012,  3,  1),
      utc(2012,  4,  1),
    ])
  })
  it('utcMonth.range(start, stop) returns months', () => {
    expect(utcMonth.range(utc(2011, 10,  4,  2), utc(2012,  4, 10, 13))).toEqual([
      utc(2011, 11,  1),
      utc(2012,  0,  1),
      utc(2012,  1,  1),
      utc(2012,  2,  1),
      utc(2012,  3,  1),
      utc(2012,  4,  1),
    ])
  })
  it('utcMonth.range(start, stop) coerces start and stop to dates', () => {
    expect(utcMonth.range(+utc(2011, 10,  4), +utc(2012,  1,  7))).toEqual([
      utc(2011, 11,  1),
      utc(2012,  0,  1),
      utc(2012,  1,  1),
    ])
  })
  it('utcMonth.range(start, stop) returns the empty array for invalid dates', () => {
    expect(utcMonth.range(new Date(NaN), Infinity)).toEqual([])
  })
  it('utcMonth.range(start, stop) returns the empty array if start >= stop', () => {
    expect(utcMonth.range(utc(2011, 11, 10), utc(2011, 10,  4))).toEqual([])
    expect(utcMonth.range(utc(2011, 10,  1), utc(2011, 10,  1))).toEqual([])
  })
  it('utcMonth.range(start, stop) returns months', () => {
    expect(utcMonth.range(utc(2010, 10, 31), utc(2011, 2, 1))).toEqual([
      utc(2010, 11, 1),
      utc(2011, 0, 1),
      utc(2011, 1, 1),
    ])
  })
  it('utcMonth.range(start, stop) has an inclusive lower bound', () => {
    expect(utcMonth.range(utc(2010, 10, 31), utc(2011, 2, 1))[0]).toEqual(utc(2010, 11, 1))
  })
  it('utcMonth.range(start, stop) has an exclusive upper bound', () => {
    expect(utcMonth.range(utc(2010, 10, 31), utc(2011, 2, 1))[2]).toEqual(utc(2011, 1, 1))
  })
  it('utcMonth.range(start, stop) can skip months', () => {
    expect(utcMonth.range(utc(2011, 1, 1), utc(2012, 1, 1), 3)).toEqual([
      utc(2011, 1, 1),
      utc(2011, 4, 1),
      utc(2011, 7, 1),
      utc(2011, 10, 1),
    ])
  })
  it('utcMonth.range(start, stop) observes start of daylight savings time', () => {
    expect(utcMonth.range(utc(2011, 0, 1), utc(2011, 4, 1))).toEqual([
      utc(2011, 0, 1),
      utc(2011, 1, 1),
      utc(2011, 2, 1),
      utc(2011, 3, 1),
    ])
  })
  it('utcMonth.range(start, stop) observes end of daylight savings time', () => {
    expect(utcMonth.range(utc(2011, 9, 1), utc(2012, 1, 1))).toEqual([
      utc(2011, 9, 1),
      utc(2011, 10, 1),
      utc(2011, 11, 1),
      utc(2012, 0, 1),
    ])
  })
  it('utcMonth.count(start, end) counts months after start (exclusive) and before end (inclusive)', () => {
    expect(utcMonth.count!(utc(2011,  0,  1), utc(2011,  4,  1))).toBe(4)
    expect(utcMonth.count!(utc(2011,  0,  1), utc(2011,  3, 30))).toBe(3)
    expect(utcMonth.count!(utc(2010, 11, 31), utc(2011,  3, 30))).toBe(4)
    expect(utcMonth.count!(utc(2010, 11, 31), utc(2011,  4,  1))).toBe(5)
    expect(utcMonth.count!(utc(2009, 11, 31), utc(2012,  4,  1))).toBe(29)
    expect(utcMonth.count!(utc(2012,  4,  1), utc(2009, 11, 31))).toBe(-29)
  })
  it('utcMonth.every(step) returns every stepth month, starting with the first month of the year', () => {
    expect(utcMonth.every!(3)!.range(utc(2008, 11, 3), utc(2010, 6, 5))).toEqual([utc(2009, 0, 1), utc(2009, 3, 1), utc(2009, 6, 1), utc(2009, 9, 1), utc(2010, 0, 1), utc(2010, 3, 1), utc(2010, 6, 1)])
  })
})
