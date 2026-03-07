import { describe, expect, it } from 'bun:test'
import { utcSunday, utcWeek } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcWeek', () => {
  it('utcWeek.floor(date) returns sundays', () => {
    expect(utcWeek.floor(utc(2010, 11, 31, 23, 59, 59))).toEqual(utc(2010, 11, 26))
    expect(utcWeek.floor(utc(2011,  0,  1,  0,  0,  0))).toEqual(utc(2010, 11, 26))
    expect(utcWeek.floor(utc(2011,  0,  1,  0,  0,  1))).toEqual(utc(2010, 11, 26))
    expect(utcWeek.floor(utc(2011,  0,  1, 23, 59, 59))).toEqual(utc(2010, 11, 26))
    expect(utcWeek.floor(utc(2011,  0,  2,  0,  0,  0))).toEqual(utc(2011,  0,  2))
    expect(utcWeek.floor(utc(2011,  0,  2,  0,  0,  1))).toEqual(utc(2011,  0,  2))
  })
  it('utcWeek.floor(date) observes the start of daylight savings time', () => {
    expect(utcWeek.floor(utc(2011,  2, 13,  1))).toEqual(utc(2011,  2, 13))
  })
  it('utcWeek.floor(date) observes the end of the daylight savings time', () => {
    expect(utcWeek.floor(utc(2011, 10,  6,  1))).toEqual(utc(2011, 10,  6))
  })
  it('utcWeek.floor(date) correctly handles years in the first century', () => {
    expect(utcWeek.floor(utc(9, 10,  6,  7))).toEqual(utc(9, 10,  1))
  })
  it('utcWeek.ceil(date) returns sundays', () => {
    expect(utcWeek.ceil(utc(2010, 11, 31, 23, 59, 59))).toEqual(utc(2011,  0,  2))
    expect(utcWeek.ceil(utc(2011,  0,  1,  0,  0,  0))).toEqual(utc(2011,  0,  2))
    expect(utcWeek.ceil(utc(2011,  0,  1,  0,  0,  1))).toEqual(utc(2011,  0,  2))
    expect(utcWeek.ceil(utc(2011,  0,  1, 23, 59, 59))).toEqual(utc(2011,  0,  2))
    expect(utcWeek.ceil(utc(2011,  0,  2,  0,  0,  0))).toEqual(utc(2011,  0,  2))
    expect(utcWeek.ceil(utc(2011,  0,  2,  0,  0,  1))).toEqual(utc(2011,  0,  9))
  })
  it('utcWeek.ceil(date) does not observe the start of daylight savings time', () => {
    expect(utcWeek.ceil(utc(2011,  2, 13,  1))).toEqual(utc(2011,  2, 20))
  })
  it('utcWeek.ceil(date) does not observe the end of the daylight savings time', () => {
    expect(utcWeek.ceil(utc(2011, 10,  6,  1))).toEqual(utc(2011, 10, 13))
  })
  it('utcWeek.offset(date, step) does not modify the passed-in date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59, 999)
    utcWeek.offset(d, +1)
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
  })
  it('utcWeek.offset(date, step) does not round the passed-in-date', () => {
    expect(utcWeek.offset(utc(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(utc(2011,  0,  7, 23, 59, 59, 999))
    expect(utcWeek.offset(utc(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(utc(2010, 11, 17, 23, 59, 59, 456))
  })
  it('utcWeek.offset(date, step) allows negative offsets', () => {
    expect(utcWeek.offset(utc(2010, 11,  1), -1)).toEqual(utc(2010, 10, 24))
    expect(utcWeek.offset(utc(2011,  0,  1), -2)).toEqual(utc(2010, 11, 18))
    expect(utcWeek.offset(utc(2011,  0,  1), -1)).toEqual(utc(2010, 11, 25))
  })
  it('utcWeek.offset(date, step) allows positive offsets', () => {
    expect(utcWeek.offset(utc(2010, 10, 24), +1)).toEqual(utc(2010, 11,  1))
    expect(utcWeek.offset(utc(2010, 11, 18), +2)).toEqual(utc(2011,  0,  1))
    expect(utcWeek.offset(utc(2010, 11, 25), +1)).toEqual(utc(2011,  0,  1))
  })
  it('utcWeek.offset(date, step) allows zero offset', () => {
    expect(utcWeek.offset(utc(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
    expect(utcWeek.offset(utc(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(utc(2010, 11, 31, 23, 59, 58,   0))
  })
  it('utcWeek.range(start, stop) returns sundays', () => {
    expect(utcWeek.range(utc(2010, 11, 21), utc(2011, 0, 12))).toEqual([
      utc(2010, 11, 26), utc(2011, 0, 2), utc(2011, 0, 9),
    ])
  })
  it('utcWeek.range(start, stop) has an inclusive lower bound', () => {
    expect(utcWeek.range(utc(2010, 11, 21), utc(2011, 0, 12))[0]).toEqual(utc(2010, 11, 26))
  })
  it('utcWeek.range(start, stop) has an exclusive upper bound', () => {
    expect(utcWeek.range(utc(2010, 11, 21), utc(2011, 0, 12))[2]).toEqual(utc(2011, 0, 9))
  })
  it('utcWeek.range(start, stop) can skip weeks', () => {
    expect(utcWeek.range(utc(2011, 0, 1), utc(2011, 3, 1), 4)).toEqual([
      utc(2011, 0, 2), utc(2011, 0, 30), utc(2011, 1, 27), utc(2011, 2, 27),
    ])
  })
  it('utcWeek.range(start, stop) does not observe start of daylight savings time', () => {
    expect(utcWeek.range(utc(2011, 2, 1), utc(2011, 2, 28))).toEqual([
      utc(2011, 2, 6), utc(2011, 2, 13), utc(2011, 2, 20), utc(2011, 2, 27),
    ])
  })
  it('utcWeek.range(start, stop) does not observe end of daylight savings time', () => {
    expect(utcWeek.range(utc(2011, 10, 1), utc(2011, 10, 30))).toEqual([
      utc(2011, 10, 6), utc(2011, 10, 13), utc(2011, 10, 20), utc(2011, 10, 27),
    ])
  })
  it('utcWeek is an alias for utcSunday', () => {
    expect(utcWeek).toBe(utcSunday)
  })
  it('utcWeek.every(step) returns every stepth Sunday, starting with the first Sunday of the month', () => {
    expect(utcWeek.every!(2)!.range(utc(2008, 11, 3), utc(2009, 1, 5))).toEqual([utc(2008, 11, 7), utc(2008, 11, 21), utc(2009, 0, 4), utc(2009, 0, 18), utc(2009, 1, 1)])
  })
})
