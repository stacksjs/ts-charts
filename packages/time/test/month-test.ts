import { describe, expect, it } from 'bun:test'
import { timeMonth, timeMonths } from '../src/index.ts'
import { local, utc } from './date.ts'

describe('timeMonth', () => {
  it('timeMonths in an alias for timeMonth.range', () => {
    expect(timeMonths).toBe(timeMonth.range)
  })

  it('timeMonth.floor(date) returns months', () => {
    expect(timeMonth.floor(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2010, 11,  1))
    expect(timeMonth.floor(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2011,  0,  1))
    expect(timeMonth.floor(local(2011,  0,  1,  0,  0,  1))).toEqual(local(2011,  0,  1))
  })

  it('timeMonth.floor(date) observes the start of daylight savings time', () => {
    expect(timeMonth.floor(local(2011,  2, 13,  1))).toEqual(local(2011,  2,  1))
  })

  it('timeMonth.floor(date) observes the end of the daylight savings time', () => {
    expect(timeMonth.floor(local(2011, 10,  6,  1))).toEqual(local(2011, 10,  1))
  })

  it('timeMonth.floor(date) correctly handles years in the first century', () => {
    expect(timeMonth.floor(local(9, 10,  6,  7))).toEqual(local(9, 10,  1))
  })

  it('timeMonth.ceil(date) returns months', () => {
    expect(timeMonth.ceil(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2011,  0,  1))
    expect(timeMonth.ceil(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2011,  0,  1))
    expect(timeMonth.ceil(local(2011,  0,  1,  0,  0,  1))).toEqual(local(2011,  1,  1))
  })

  it('timeMonth.ceil(date) observes the start of daylight savings time', () => {
    expect(timeMonth.ceil(local(2011,  2, 13,  1))).toEqual(local(2011,  3,  1))
  })

  it('timeMonth.ceil(date) observes the end of the daylight savings time', () => {
    expect(timeMonth.ceil(local(2011, 10,  6,  1))).toEqual(local(2011, 11,  1))
  })

  it('timeMonth.offset(date) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeMonth.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })

  it('timeMonth.offset(date) does not round the passed-in-date', () => {
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011,  0, 31, 23, 59, 59, 999))
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2010,  9, 31, 23, 59, 59, 456))
  })

  it('timeMonth.offset(date) allows negative offsets', () => {
    expect(timeMonth.offset(local(2010, 11,  1), -1)).toEqual(local(2010, 10,  1))
    expect(timeMonth.offset(local(2011,  0,  1), -2)).toEqual(local(2010, 10,  1))
    expect(timeMonth.offset(local(2011,  0,  1), -1)).toEqual(local(2010, 11,  1))
  })

  it('timeMonth.offset(date) allows positive offsets', () => {
    expect(timeMonth.offset(local(2010, 10,  1), +1)).toEqual(local(2010, 11,  1))
    expect(timeMonth.offset(local(2010, 10,  1), +2)).toEqual(local(2011,  0,  1))
    expect(timeMonth.offset(local(2010, 11,  1), +1)).toEqual(local(2011,  0,  1))
  })

  it('timeMonth.offset(date) allows zero offset', () => {
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })

  it('timeMonth.floor(date) returns months (2)', () => {
    expect(timeMonth.floor(local(2010, 11, 31, 23))).toEqual(local(2010, 11,  1))
    expect(timeMonth.floor(local(2011,  0,  1,  0))).toEqual(local(2011,  0,  1))
    expect(timeMonth.floor(local(2011,  0,  1,  1))).toEqual(local(2011,  0,  1))
  })

  it('timeMonth.floor(date) observes daylight saving', () => {
    expect(timeMonth.floor(utc(2011,  2, 13,  7))).toEqual(local(2011,  2,  1))
    expect(timeMonth.floor(utc(2011,  2, 13,  8))).toEqual(local(2011,  2,  1))
    expect(timeMonth.floor(utc(2011,  2, 13,  9))).toEqual(local(2011,  2,  1))
    expect(timeMonth.floor(utc(2011,  2, 13, 10))).toEqual(local(2011,  2,  1))
    expect(timeMonth.floor(utc(2011, 10,  6,  7))).toEqual(local(2011, 10,  1))
    expect(timeMonth.floor(utc(2011, 10,  6,  8))).toEqual(local(2011, 10,  1))
    expect(timeMonth.floor(utc(2011, 10,  6,  9))).toEqual(local(2011, 10,  1))
    expect(timeMonth.floor(utc(2011, 10,  6, 10))).toEqual(local(2011, 10,  1))
  })

  it('timeMonth.floor(date) handles years in the first century', () => {
    expect(timeMonth.floor(local(9, 10,  6,  7))).toEqual(local(9, 10,  1))
  })

  it('timeMonth.round(date) returns months', () => {
    expect(timeMonth.round(local(2010, 11, 16, 12))).toEqual(local(2011,  0,  1))
    expect(timeMonth.round(local(2010, 11, 16, 11))).toEqual(local(2010, 11,  1))
  })

  it('timeMonth.round(date) observes daylight saving', () => {
    expect(timeMonth.round(utc(2011,  2, 13,  7))).toEqual(local(2011,  2,  1))
    expect(timeMonth.round(utc(2011,  2, 13,  8))).toEqual(local(2011,  2,  1))
    expect(timeMonth.round(utc(2011,  2, 13,  9))).toEqual(local(2011,  2,  1))
    expect(timeMonth.round(utc(2011,  2, 13, 20))).toEqual(local(2011,  2,  1))
    expect(timeMonth.round(utc(2011, 10,  6,  7))).toEqual(local(2011, 10,  1))
    expect(timeMonth.round(utc(2011, 10,  6,  8))).toEqual(local(2011, 10,  1))
    expect(timeMonth.round(utc(2011, 10,  6,  9))).toEqual(local(2011, 10,  1))
    expect(timeMonth.round(utc(2011, 10,  6, 20))).toEqual(local(2011, 10,  1))
  })

  it('timeMonth.round(date) handles midnight for leap years', () => {
    expect(timeMonth.round(utc(2012,  2,  1,  0))).toEqual(local(2012,  2,  1))
  })

  it('timeMonth.ceil(date) returns months (2)', () => {
    expect(timeMonth.ceil(local(2010, 10, 30, 23))).toEqual(local(2010, 11,  1))
    expect(timeMonth.ceil(local(2010, 11,  1,  1))).toEqual(local(2011,  0,  1))
    expect(timeMonth.ceil(local(2011, 1, 1))).toEqual(local(2011, 1, 1))
    expect(timeMonth.ceil(local(2011, 2, 1))).toEqual(local(2011, 2, 1))
    expect(timeMonth.ceil(local(2011, 3, 1))).toEqual(local(2011, 3, 1))
  })

  it('timeMonth.ceil(date) observes daylight saving', () => {
    expect(timeMonth.ceil(utc(2011,  2, 13,  7))).toEqual(local(2011,  3,  1))
    expect(timeMonth.ceil(utc(2011,  2, 13,  8))).toEqual(local(2011,  3,  1))
    expect(timeMonth.ceil(utc(2011,  2, 13,  9))).toEqual(local(2011,  3,  1))
    expect(timeMonth.ceil(utc(2011,  2, 13, 10))).toEqual(local(2011,  3,  1))
    expect(timeMonth.ceil(utc(2011, 10,  6,  7))).toEqual(local(2011, 11,  1))
    expect(timeMonth.ceil(utc(2011, 10,  6,  8))).toEqual(local(2011, 11,  1))
    expect(timeMonth.ceil(utc(2011, 10,  6,  9))).toEqual(local(2011, 11,  1))
    expect(timeMonth.ceil(utc(2011, 10,  6, 10))).toEqual(local(2011, 11,  1))
  })

  it('timeMonth.ceil(date) handles midnight for leap years', () => {
    expect(timeMonth.ceil(utc(2012,  2,  1,  0))).toEqual(local(2012,  2,  1))
  })

  it('timeMonth.offset(date) is an alias for timeMonth.offset(date, 1)', () => {
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 59, 999))).toEqual(local(2011,  0, 31, 23, 59, 59, 999))
  })

  it('timeMonth.offset(date, step) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeMonth.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })

  it('timeMonth.offset(date, step) does not round the passed-in date', () => {
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011,  0, 31, 23, 59, 59, 999))
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2010,  9, 31, 23, 59, 59, 456))
  })

  it('timeMonth.offset(date, step) allows step to be negative', () => {
    expect(timeMonth.offset(local(2010, 11, 31), -1)).toEqual(local(2010, 10, 31))
    expect(timeMonth.offset(local(2011,  0,  1), -2)).toEqual(local(2010, 10,  1))
    expect(timeMonth.offset(local(2011,  0,  1), -1)).toEqual(local(2010, 11,  1))
  })

  it('timeMonth.offset(date, step) allows step to be positive', () => {
    expect(timeMonth.offset(local(2010, 11, 31), +1)).toEqual(local(2011,  0, 31))
    expect(timeMonth.offset(local(2010, 11, 30), +2)).toEqual(local(2011,  1, 30))
    expect(timeMonth.offset(local(2010, 11, 30), +1)).toEqual(local(2011,  0, 30))
  })

  it('timeMonth.offset(date, step) allows step to be zero', () => {
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeMonth.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })

  it('timeMonth.range(start, stop) returns months between start (inclusive) and stop (exclusive)', () => {
    expect(timeMonth.range(local(2011, 11,  1), local(2012,  5,  1))).toEqual([
      local(2011, 11,  1), local(2012,  0,  1), local(2012,  1,  1),
      local(2012,  2,  1), local(2012,  3,  1), local(2012,  4,  1),
    ])
  })

  it('timeMonth.range(start, stop) returns months', () => {
    expect(timeMonth.range(local(2011, 10,  4,  2), local(2012,  4, 10, 13))).toEqual([
      local(2011, 11,  1), local(2012,  0,  1), local(2012,  1,  1),
      local(2012,  2,  1), local(2012,  3,  1), local(2012,  4,  1),
    ])
  })

  it('timeMonth.range(start, stop) coerces start and stop to dates', () => {
    expect(timeMonth.range(+local(2011, 10,  4), +local(2012,  1,  7))).toEqual([
      local(2011, 11,  1), local(2012,  0,  1), local(2012,  1,  1),
    ])
  })

  it('timeMonth.range(start, stop) returns the empty array for invalid dates', () => {
    expect(timeMonth.range(new Date(NaN), Infinity)).toEqual([])
  })

  it('timeMonth.range(start, stop) returns the empty array if start >= stop', () => {
    expect(timeMonth.range(local(2011, 11, 10), local(2011, 10,  4))).toEqual([])
    expect(timeMonth.range(local(2011, 10,  1), local(2011, 10,  1))).toEqual([])
  })

  it('timeMonth.range(start, stop) returns months (2)', () => {
    expect(timeMonth.range(local(2010, 10, 31), local(2011, 2, 1))).toEqual([
      local(2010, 11, 1), local(2011, 0, 1), local(2011, 1, 1),
    ])
  })

  it('timeMonth.range(start, stop) has an inclusive lower bound', () => {
    expect(timeMonth.range(local(2010, 10, 31), local(2011, 2, 1))[0]).toEqual(local(2010, 11, 1))
  })

  it('timeMonth.range(start, stop) has an exclusive upper bound', () => {
    expect(timeMonth.range(local(2010, 10, 31), local(2011, 2, 1))[2]).toEqual(local(2011, 1, 1))
  })

  it('timeMonth.range(start, stop) can skip months', () => {
    expect(timeMonth.range(local(2011, 1, 1), local(2012, 1, 1), 3)).toEqual([
      local(2011, 1, 1), local(2011, 4, 1), local(2011, 7, 1), local(2011, 10, 1),
    ])
  })

  it('timeMonth.range(start, stop) observes start of daylight savings time', () => {
    expect(timeMonth.range(local(2011, 0, 1), local(2011, 4, 1))).toEqual([
      local(2011, 0, 1), local(2011, 1, 1), local(2011, 2, 1), local(2011, 3, 1),
    ])
  })

  it('timeMonth.range(start, stop) observes end of daylight savings time', () => {
    expect(timeMonth.range(local(2011, 9, 1), local(2012, 1, 1))).toEqual([
      local(2011, 9, 1), local(2011, 10, 1), local(2011, 11, 1), local(2012, 0, 1),
    ])
  })

  it('timeMonth.count(start, end) counts months after start (exclusive) and before end (inclusive)', () => {
    expect(timeMonth.count!(local(2011,  0,  1), local(2011,  4,  1))).toBe(4)
    expect(timeMonth.count!(local(2011,  0,  1), local(2011,  3, 30))).toBe(3)
    expect(timeMonth.count!(local(2010, 11, 31), local(2011,  3, 30))).toBe(4)
    expect(timeMonth.count!(local(2010, 11, 31), local(2011,  4,  1))).toBe(5)
    expect(timeMonth.count!(local(2009, 11, 31), local(2012,  4,  1))).toBe(29)
    expect(timeMonth.count!(local(2012,  4,  1), local(2009, 11, 31))).toBe(-29)
  })

  it('timeMonth.every(step) returns every stepth month, starting with the first month of the year', () => {
    expect(timeMonth.every!(3)!.range(local(2008, 11, 3), local(2010, 6, 5))).toEqual([local(2009, 0, 1), local(2009, 3, 1), local(2009, 6, 1), local(2009, 9, 1), local(2010, 0, 1), local(2010, 3, 1), local(2010, 6, 1)])
  })
})
