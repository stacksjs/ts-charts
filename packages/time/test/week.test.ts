import { describe, expect, it } from 'bun:test'
import { timeSunday, timeWeek } from '../src/index.ts'
import { local } from './date.ts'

describe('timeWeek', () => {
  it('timeWeek.floor(date) returns sundays', () => {
    expect(timeWeek.floor(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2010, 11, 26))
    expect(timeWeek.floor(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2010, 11, 26))
    expect(timeWeek.floor(local(2011,  0,  1,  0,  0,  1))).toEqual(local(2010, 11, 26))
    expect(timeWeek.floor(local(2011,  0,  1, 23, 59, 59))).toEqual(local(2010, 11, 26))
    expect(timeWeek.floor(local(2011,  0,  2,  0,  0,  0))).toEqual(local(2011,  0,  2))
    expect(timeWeek.floor(local(2011,  0,  2,  0,  0,  1))).toEqual(local(2011,  0,  2))
  })
  it('timeWeek.floor(date) observes the start of daylight savings time', () => {
    expect(timeWeek.floor(local(2011,  2, 13,  1))).toEqual(local(2011,  2, 13))
  })
  it('timeWeek.floor(date) observes the end of the daylight savings time', () => {
    expect(timeWeek.floor(local(2011, 10,  6,  1))).toEqual(local(2011, 10,  6))
  })
  it('timeWeek.floor(date) correctly handles years in the first century', () => {
    expect(timeWeek.floor(local(9, 10,  6,  7))).toEqual(local(9, 10,  1))
  })
  it('timeWeek.ceil(date) returns sundays', () => {
    expect(timeWeek.ceil(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2011,  0,  2))
    expect(timeWeek.ceil(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2011,  0,  2))
    expect(timeWeek.ceil(local(2011,  0,  1,  0,  0,  1))).toEqual(local(2011,  0,  2))
    expect(timeWeek.ceil(local(2011,  0,  1, 23, 59, 59))).toEqual(local(2011,  0,  2))
    expect(timeWeek.ceil(local(2011,  0,  2,  0,  0,  0))).toEqual(local(2011,  0,  2))
    expect(timeWeek.ceil(local(2011,  0,  2,  0,  0,  1))).toEqual(local(2011,  0,  9))
  })
  it('timeWeek.ceil(date) observes the start of daylight savings time', () => {
    expect(timeWeek.ceil(local(2011,  2, 13,  1))).toEqual(local(2011,  2, 20))
  })
  it('timeWeek.ceil(date) observes the end of the daylight savings time', () => {
    expect(timeWeek.ceil(local(2011, 10,  6,  1))).toEqual(local(2011, 10, 13))
  })
  it('timeWeek.offset(date, step) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeWeek.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })
  it('timeWeek.offset(date, step) does not round the passed-in-date', () => {
    expect(timeWeek.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011,  0,  7, 23, 59, 59, 999))
    expect(timeWeek.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2010, 11, 17, 23, 59, 59, 456))
  })
  it('timeWeek.offset(date, step) allows negative offsets', () => {
    expect(timeWeek.offset(local(2010, 11,  1), -1)).toEqual(local(2010, 10, 24))
    expect(timeWeek.offset(local(2011,  0,  1), -2)).toEqual(local(2010, 11, 18))
    expect(timeWeek.offset(local(2011,  0,  1), -1)).toEqual(local(2010, 11, 25))
  })
  it('timeWeek.offset(date, step) allows positive offsets', () => {
    expect(timeWeek.offset(local(2010, 10, 24), +1)).toEqual(local(2010, 11,  1))
    expect(timeWeek.offset(local(2010, 11, 18), +2)).toEqual(local(2011,  0,  1))
    expect(timeWeek.offset(local(2010, 11, 25), +1)).toEqual(local(2011,  0,  1))
  })
  it('timeWeek.offset(date, step) allows zero offset', () => {
    expect(timeWeek.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeWeek.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })
  it('timeWeek.range(start, stop) returns sundays', () => {
    expect(timeWeek.range(local(2010, 11, 21), local(2011, 0, 12))).toEqual([
      local(2010, 11, 26), local(2011, 0, 2), local(2011, 0, 9),
    ])
  })
  it('timeWeek.range(start, stop) has an inclusive lower bound', () => {
    expect(timeWeek.range(local(2010, 11, 21), local(2011, 0, 12))[0]).toEqual(local(2010, 11, 26))
  })
  it('timeWeek.range(start, stop) has an exclusive upper bound', () => {
    expect(timeWeek.range(local(2010, 11, 21), local(2011, 0, 12))[2]).toEqual(local(2011, 0, 9))
  })
  it('timeWeek.range(start, stop) can skip weeks', () => {
    expect(timeWeek.range(local(2011, 0, 1), local(2011, 3, 1), 4)).toEqual([
      local(2011, 0, 2), local(2011, 0, 30), local(2011, 1, 27), local(2011, 2, 27),
    ])
  })
  it('timeWeek.range(start, stop) observes start of daylight savings time', () => {
    expect(timeWeek.range(local(2011, 2, 1), local(2011, 2, 28))).toEqual([
      local(2011, 2, 6), local(2011, 2, 13), local(2011, 2, 20), local(2011, 2, 27),
    ])
  })
  it('timeWeek.range(start, stop) observes end of daylight savings time', () => {
    expect(timeWeek.range(local(2011, 10, 1), local(2011, 10, 30))).toEqual([
      local(2011, 10, 6), local(2011, 10, 13), local(2011, 10, 20), local(2011, 10, 27),
    ])
  })
  it('timeWeek is an alias for timeSunday', () => {
    expect(timeWeek).toBe(timeSunday)
  })
  it('timeWeek.every(step) returns every stepth Sunday, starting with the first Sunday of the month', () => {
    expect(timeWeek.every!(2)!.range(local(2008, 11, 3), local(2009, 1, 5))).toEqual([local(2008, 11, 7), local(2008, 11, 21), local(2009, 0, 4), local(2009, 0, 18), local(2009, 1, 1)])
  })
})
