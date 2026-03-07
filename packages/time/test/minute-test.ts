import { describe, expect, it } from 'bun:test'
import { timeMinute } from '../src/index.ts'
import { local, utc } from './date.ts'

describe('timeMinute', () => {
  it('timeMinute.floor(date) returns minutes', () => {
    expect(timeMinute.floor(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2010, 11, 31, 23, 59))
    expect(timeMinute.floor(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2011,  0,  1,  0,  0))
    expect(timeMinute.floor(local(2011,  0,  1,  0,  0, 59))).toEqual(local(2011,  0,  1,  0,  0))
    expect(timeMinute.floor(local(2011,  0,  1,  0,  1,  0))).toEqual(local(2011,  0,  1,  0,  1))
  })

  it('timeMinute.ceil(date) returns minutes', () => {
    expect(timeMinute.ceil(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2011,  0,  1,  0,  0))
    expect(timeMinute.ceil(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2011,  0,  1,  0,  0))
    expect(timeMinute.ceil(local(2011,  0,  1,  0,  0, 59))).toEqual(local(2011,  0,  1,  0,  1))
    expect(timeMinute.ceil(local(2011,  0,  1,  0,  1,  0))).toEqual(local(2011,  0,  1,  0,  1))
  })

  it('timeMinute.offset(date) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeMinute.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })

  it('timeMinute.offset(date) does not round the passed-in-date', () => {
    expect(timeMinute.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011,  0,  1,  0,  0, 59, 999))
    expect(timeMinute.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2010, 11, 31, 23, 57, 59, 456))
  })

  it('timeMinute.offset(date) allows negative offsets', () => {
    expect(timeMinute.offset(local(2010, 11, 31, 23, 12), -1)).toEqual(local(2010, 11, 31, 23, 11))
    expect(timeMinute.offset(local(2011,  0,  1,  0,  1), -2)).toEqual(local(2010, 11, 31, 23, 59))
    expect(timeMinute.offset(local(2011,  0,  1,  0,  0), -1)).toEqual(local(2010, 11, 31, 23, 59))
  })

  it('timeMinute.offset(date) allows positive offsets', () => {
    expect(timeMinute.offset(local(2010, 11, 31, 23, 11), +1)).toEqual(local(2010, 11, 31, 23, 12))
    expect(timeMinute.offset(local(2010, 11, 31, 23, 59), +2)).toEqual(local(2011,  0,  1,  0,  1))
    expect(timeMinute.offset(local(2010, 11, 31, 23, 59), +1)).toEqual(local(2011,  0,  1,  0,  0))
  })

  it('timeMinute.offset(date) allows zero offset', () => {
    expect(timeMinute.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeMinute.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })

  it('timeMinute.range(start, stop), returns minutes', () => {
    expect(timeMinute.range(local(2010, 11, 31, 23, 59), local(2011, 0, 1, 0, 2))).toEqual([
      local(2010, 11, 31, 23, 59),
      local(2011, 0, 1, 0, 0),
      local(2011, 0, 1, 0, 1),
    ])
  })

  it('timeMinute.range(start, stop), has an inclusive lower bound', () => {
    expect(timeMinute.range(local(2010, 11, 31, 23, 59), local(2011, 0, 1, 0, 2))[0]).toEqual(local(2010, 11, 31, 23, 59))
  })

  it('timeMinute.range(start, stop), has an exclusive upper bound', () => {
    expect(timeMinute.range(local(2010, 11, 31, 23, 59), local(2011, 0, 1, 0, 2))[2]).toEqual(local(2011, 0, 1, 0, 1))
  })

  it('timeMinute.range(start, stop), can skip minutes', () => {
    expect(timeMinute.range(local(2011, 1, 1, 12, 7), local(2011, 1, 1, 13, 7), 15)).toEqual([
      local(2011, 1, 1, 12, 7),
      local(2011, 1, 1, 12, 22),
      local(2011, 1, 1, 12, 37),
      local(2011, 1, 1, 12, 52),
    ])
  })

  it('timeMinute.range(start, stop), observes start of daylight savings time', () => {
    expect(timeMinute.range(utc(2011, 2, 13, 9, 59), utc(2011, 2, 13, 10, 2))).toEqual([
      utc(2011, 2, 13, 9, 59),
      utc(2011, 2, 13, 10, 0),
      utc(2011, 2, 13, 10, 1),
    ])
  })

  it('timeMinute.range(start, stop), observes end of daylight savings time', () => {
    expect(timeMinute.range(utc(2011, 10, 6, 8, 59), utc(2011, 10, 6, 9, 2))).toEqual([
      utc(2011, 10, 6, 8, 59),
      utc(2011, 10, 6, 9, 0),
      utc(2011, 10, 6, 9, 1),
    ])
  })

  it('timeMinute.every(step) returns every stepth minute, starting with the first minute of the hour', () => {
    expect(timeMinute.every!(15)!.range(local(2008, 11, 30, 12, 47), local(2008, 11, 30, 13, 57))).toEqual([local(2008, 11, 30, 13, 0), local(2008, 11, 30, 13, 15), local(2008, 11, 30, 13, 30), local(2008, 11, 30, 13, 45)])
    expect(timeMinute.every!(30)!.range(local(2008, 11, 30, 12, 47), local(2008, 11, 30, 13, 57))).toEqual([local(2008, 11, 30, 13, 0), local(2008, 11, 30, 13, 30)])
  })

  it('timeMinute.range(start, stop) returns every minute crossing the daylight savings boundary', () => {
    expect(timeMinute.range(new Date(1478422800000 - 2 * 6e4), new Date(1478422800000 + 2 * 6e4))).toEqual([
      new Date(1478422680000),
      new Date(1478422740000),
      new Date(1478422800000),
      new Date(1478422860000),
    ])
  })
})
