import { describe, expect, it } from 'bun:test'
import { timeSecond } from '../src/index.ts'
import { local, utc } from './date.ts'

describe('timeSecond', () => {
  it('timeSecond.floor(date) returns seconds', () => {
    expect(timeSecond.floor(local(2010, 11, 31, 23, 59, 59, 999))).toEqual(local(2010, 11, 31, 23, 59, 59))
    expect(timeSecond.floor(local(2011,  0,  1,  0,  0,  0,   0))).toEqual(local(2011,  0,  1,  0,  0,  0))
    expect(timeSecond.floor(local(2011,  0,  1,  0,  0,  0,   1))).toEqual(local(2011,  0,  1,  0,  0,  0))
  })

  it('timeSecond.round(date) returns seconds', () => {
    expect(timeSecond.round(local(2010, 11, 31, 23, 59, 59, 999))).toEqual(local(2011,  0,  1,  0,  0,  0))
    expect(timeSecond.round(local(2011,  0,  1,  0,  0,  0, 499))).toEqual(local(2011,  0,  1,  0,  0,  0))
    expect(timeSecond.round(local(2011,  0,  1,  0,  0,  0, 500))).toEqual(local(2011,  0,  1,  0,  0,  1))
  })

  it('timeSecond.ceil(date) returns seconds', () => {
    expect(timeSecond.ceil(local(2010, 11, 31, 23, 59, 59, 999))).toEqual(local(2011,  0,  1,  0,  0,  0))
    expect(timeSecond.ceil(local(2011,  0,  1,  0,  0,  0,   0))).toEqual(local(2011,  0,  1,  0,  0,  0))
    expect(timeSecond.ceil(local(2011,  0,  1,  0,  0,  0,   1))).toEqual(local(2011,  0,  1,  0,  0,  1))
  })

  it('timeSecond.offset(date, step) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeSecond.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })

  it('timeSecond.offset(date, step) does not round the passed-in-date', () => {
    expect(timeSecond.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011,  0,  1,  0,  0,  0, 999))
    expect(timeSecond.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2010, 11, 31, 23, 59, 57, 456))
  })

  it('timeSecond.offset(date, step) allows negative offsets', () => {
    expect(timeSecond.offset(local(2010, 11, 31, 23, 59, 59), -1)).toEqual(local(2010, 11, 31, 23, 59, 58))
    expect(timeSecond.offset(local(2011,  0,  1,  0,  0,  0), -2)).toEqual(local(2010, 11, 31, 23, 59, 58))
    expect(timeSecond.offset(local(2011,  0,  1,  0,  0,  0), -1)).toEqual(local(2010, 11, 31, 23, 59, 59))
  })

  it('timeSecond.offset(date, step) allows positive offsets', () => {
    expect(timeSecond.offset(local(2010, 11, 31, 23, 59, 58), +1)).toEqual(local(2010, 11, 31, 23, 59, 59))
    expect(timeSecond.offset(local(2010, 11, 31, 23, 59, 58), +2)).toEqual(local(2011,  0,  1,  0,  0,  0))
    expect(timeSecond.offset(local(2010, 11, 31, 23, 59, 59), +1)).toEqual(local(2011,  0,  1,  0,  0,  0))
  })

  it('timeSecond.offset(date, step) allows zero offset', () => {
    expect(timeSecond.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeSecond.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })

  it('timeSecond.range(start, stop) returns seconds', () => {
    expect(timeSecond.range(local(2010, 11, 31, 23, 59, 59), local(2011, 0, 1, 0, 0, 2))).toEqual([
      local(2010, 11, 31, 23, 59, 59),
      local(2011, 0, 1, 0, 0, 0),
      local(2011, 0, 1, 0, 0, 1),
    ])
  })

  it('timeSecond.range(start, stop) has an inclusive lower bound', () => {
    expect(timeSecond.range(local(2010, 11, 31, 23, 59, 59), local(2011, 0, 1, 0, 0, 2))[0]).toEqual(local(2010, 11, 31, 23, 59, 59))
  })

  it('timeSecond.range(start, stop) has an exclusive upper bound', () => {
    expect(timeSecond.range(local(2010, 11, 31, 23, 59, 59), local(2011, 0, 1, 0, 0, 2))[2]).toEqual(local(2011, 0, 1, 0, 0, 1))
  })

  it('timeSecond.range(start, stop, step) can skip seconds', () => {
    expect(timeSecond.range(local(2011, 1, 1, 12, 0, 7), local(2011, 1, 1, 12, 1, 7), 15)).toEqual([
      local(2011, 1, 1, 12, 0, 7),
      local(2011, 1, 1, 12, 0, 22),
      local(2011, 1, 1, 12, 0, 37),
      local(2011, 1, 1, 12, 0, 52),
    ])
  })

  it('timeSecond.range(start, stop) observes start of daylight savings time', () => {
    expect(timeSecond.range(utc(2011, 2, 13, 9, 59, 59), utc(2011, 2, 13, 10, 0, 2))).toEqual([
      utc(2011, 2, 13, 9, 59, 59),
      utc(2011, 2, 13, 10, 0, 0),
      utc(2011, 2, 13, 10, 0, 1),
    ])
  })

  it('timeSecond.range(start, stop) observes end of daylight savings time', () => {
    expect(timeSecond.range(utc(2011, 10, 6, 8, 59, 59), utc(2011, 10, 6, 9, 0, 2))).toEqual([
      utc(2011, 10, 6, 8, 59, 59),
      utc(2011, 10, 6, 9, 0, 0),
      utc(2011, 10, 6, 9, 0, 1),
    ])
  })

  it('timeSecond.every(step) returns every stepth second, starting with the first second of the minute', () => {
    expect(timeSecond.every!(15)!.range(local(2008, 11, 30, 12, 36, 47), local(2008, 11, 30, 12, 37, 57))).toEqual([local(2008, 11, 30, 12, 37, 0), local(2008, 11, 30, 12, 37, 15), local(2008, 11, 30, 12, 37, 30), local(2008, 11, 30, 12, 37, 45)])
    expect(timeSecond.every!(30)!.range(local(2008, 11, 30, 12, 36, 47), local(2008, 11, 30, 12, 37, 57))).toEqual([local(2008, 11, 30, 12, 37, 0), local(2008, 11, 30, 12, 37, 30)])
  })

  it('timeSecond.range(start, stop) returns every second crossing the daylight savings boundary', () => {
    expect(timeSecond.range(new Date(1478422800000 - 2 * 1e3), new Date(1478422800000 + 2 * 1e3))).toEqual([
      new Date(1478422798000),
      new Date(1478422799000),
      new Date(1478422800000),
      new Date(1478422801000),
    ])
  })
})
