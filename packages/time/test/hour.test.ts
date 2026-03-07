import { describe, expect, it } from 'bun:test'
import { timeHour } from '../src/index.ts'
import { local, utc } from './date.ts'

describe('timeHour', () => {
  it('timeHour.floor(date) returns hours', () => {
    expect(timeHour.floor(local(2010, 11, 31, 23, 59))).toEqual(local(2010, 11, 31, 23))
    expect(timeHour.floor(local(2011,  0,  1,  0,  0))).toEqual(local(2011,  0,  1,  0))
    expect(timeHour.floor(local(2011,  0,  1,  0,  1))).toEqual(local(2011,  0,  1,  0))
  })

  it('timeHour.floor(date) observes start of daylight savings time', () => {
    expect(timeHour.floor(utc(2011,  2, 13,  8, 59))).toEqual(utc(2011,  2, 13,  8))
    expect(timeHour.floor(utc(2011,  2, 13,  9,  0))).toEqual(utc(2011,  2, 13,  9))
    expect(timeHour.floor(utc(2011,  2, 13,  9,  1))).toEqual(utc(2011,  2, 13,  9))
    expect(timeHour.floor(utc(2011,  2, 13,  9, 59))).toEqual(utc(2011,  2, 13,  9))
    expect(timeHour.floor(utc(2011,  2, 13, 10,  0))).toEqual(utc(2011,  2, 13, 10))
    expect(timeHour.floor(utc(2011,  2, 13, 10,  1))).toEqual(utc(2011,  2, 13, 10))
  })

  it('timeHour.floor(date) observes end of daylight savings time', () => {
    expect(timeHour.floor(utc(2011, 10,  6,  7, 59))).toEqual(utc(2011, 10,  6,  7))
    expect(timeHour.floor(utc(2011, 10,  6,  8,  0))).toEqual(utc(2011, 10,  6,  8))
    expect(timeHour.floor(utc(2011, 10,  6,  8,  1))).toEqual(utc(2011, 10,  6,  8))
    expect(timeHour.floor(utc(2011, 10,  6,  8, 59))).toEqual(utc(2011, 10,  6,  8))
    expect(timeHour.floor(utc(2011, 10,  6,  9,  0))).toEqual(utc(2011, 10,  6,  9))
    expect(timeHour.floor(utc(2011, 10,  6,  9,  1))).toEqual(utc(2011, 10,  6,  9))
  })

  it('timeHour.ceil(date) returns hours', () => {
    expect(timeHour.ceil(local(2010, 11, 31, 23, 59))).toEqual(local(2011,  0,  1,  0))
    expect(timeHour.ceil(local(2011,  0,  1,  0,  0))).toEqual(local(2011,  0,  1,  0))
    expect(timeHour.ceil(local(2011,  0,  1,  0,  1))).toEqual(local(2011,  0,  1,  1))
  })

  it('timeHour.ceil(date) observes start of daylight savings time', () => {
    expect(timeHour.ceil(utc(2011,  2, 13,  8, 59))).toEqual(utc(2011,  2, 13,  9))
    expect(timeHour.ceil(utc(2011,  2, 13,  9,  0))).toEqual(utc(2011,  2, 13,  9))
    expect(timeHour.ceil(utc(2011,  2, 13,  9,  1))).toEqual(utc(2011,  2, 13, 10))
    expect(timeHour.ceil(utc(2011,  2, 13,  9, 59))).toEqual(utc(2011,  2, 13, 10))
    expect(timeHour.ceil(utc(2011,  2, 13, 10,  0))).toEqual(utc(2011,  2, 13, 10))
    expect(timeHour.ceil(utc(2011,  2, 13, 10,  1))).toEqual(utc(2011,  2, 13, 11))
  })

  it('timeHour.ceil(date) observes end of daylight savings time', () => {
    expect(timeHour.ceil(utc(2011, 10,  6,  7, 59))).toEqual(utc(2011, 10,  6,  8))
    expect(timeHour.ceil(utc(2011, 10,  6,  8,  0))).toEqual(utc(2011, 10,  6,  8))
    expect(timeHour.ceil(utc(2011, 10,  6,  8,  1))).toEqual(utc(2011, 10,  6,  9))
    expect(timeHour.ceil(utc(2011, 10,  6,  8, 59))).toEqual(utc(2011, 10,  6,  9))
    expect(timeHour.ceil(utc(2011, 10,  6,  9,  0))).toEqual(utc(2011, 10,  6,  9))
    expect(timeHour.ceil(utc(2011, 10,  6,  9,  1))).toEqual(utc(2011, 10,  6, 10))
  })

  it('timeHour.offset(date) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeHour.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })

  it('timeHour.offset(date) does not round the passed-in-date', () => {
    expect(timeHour.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011,  0,  1,  0, 59, 59, 999))
    expect(timeHour.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2010, 11, 31, 21, 59, 59, 456))
  })

  it('timeHour.offset(date) allows negative offsets', () => {
    expect(timeHour.offset(local(2010, 11, 31, 12), -1)).toEqual(local(2010, 11, 31, 11))
    expect(timeHour.offset(local(2011,  0,  1,  1), -2)).toEqual(local(2010, 11, 31, 23))
    expect(timeHour.offset(local(2011,  0,  1,  0), -1)).toEqual(local(2010, 11, 31, 23))
  })

  it('timeHour.offset(date) allows positive offsets', () => {
    expect(timeHour.offset(local(2010, 11, 31, 11), +1)).toEqual(local(2010, 11, 31, 12))
    expect(timeHour.offset(local(2010, 11, 31, 23), +2)).toEqual(local(2011,  0,  1,  1))
    expect(timeHour.offset(local(2010, 11, 31, 23), +1)).toEqual(local(2011,  0,  1,  0))
  })

  it('timeHour.offset(date) allows zero offset', () => {
    expect(timeHour.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeHour.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })

  it('timeHour.range(start, stop) returns hours', () => {
    expect(timeHour.range(local(2010, 11, 31, 12, 30), local(2010, 11, 31, 15, 30))).toEqual([
      local(2010, 11, 31, 13),
      local(2010, 11, 31, 14),
      local(2010, 11, 31, 15),
    ])
  })

  it('timeHour.range(start, stop) has an inclusive lower bound', () => {
    expect(timeHour.range(local(2010, 11, 31, 23), local(2011, 0, 1, 2))[0]).toEqual(local(2010, 11, 31, 23))
  })

  it('timeHour.range(start, stop) has an exclusive upper bound', () => {
    expect(timeHour.range(local(2010, 11, 31, 23), local(2011, 0, 1, 2))[2]).toEqual(local(2011, 0, 1, 1))
  })

  it('timeHour.range(start, stop) can skip hours', () => {
    expect(timeHour.range(local(2011, 1, 1, 1), local(2011, 1, 1, 13), 3)).toEqual([
      local(2011, 1, 1, 1),
      local(2011, 1, 1, 4),
      local(2011, 1, 1, 7),
      local(2011, 1, 1, 10),
    ])
  })

  it('timeHour.range(start, stop) observes start of daylight savings time', () => {
    expect(timeHour.range(local(2011, 2, 13, 1), local(2011, 2, 13, 5))).toEqual([
      utc(2011, 2, 13, 9),
      utc(2011, 2, 13, 10),
      utc(2011, 2, 13, 11),
    ])
  })

  it('timeHour.range(start, stop) observes end of daylight savings time', () => {
    expect(timeHour.range(local(2011, 10, 6, 0), local(2011, 10, 6, 2))).toEqual([
      utc(2011, 10, 6, 7),
      utc(2011, 10, 6, 8),
      utc(2011, 10, 6, 9),
    ])
  })

  it('timeHour.every(step) returns every stepth hour, starting with the first hour of the day', () => {
    expect(timeHour.every!(4)!.range(local(2008, 11, 30, 12, 47), local(2008, 11, 31, 13, 57))).toEqual([local(2008, 11, 30, 16), local(2008, 11, 30, 20), local(2008, 11, 31, 0), local(2008, 11, 31, 4), local(2008, 11, 31, 8), local(2008, 11, 31, 12)])
    expect(timeHour.every!(12)!.range(local(2008, 11, 30, 12, 47), local(2008, 11, 31, 13, 57))).toEqual([local(2008, 11, 31, 0), local(2008, 11, 31, 12)])
  })

  it('timeHour.range(start, stop) returns every hour crossing the daylight savings boundary', () => {
    expect(timeHour.range(new Date(1478422800000 - 2 * 36e5), new Date(1478422800000 + 2 * 36e5))).toEqual([
      new Date(1478415600000),
      new Date(1478419200000),
      new Date(1478422800000),
      new Date(1478426400000),
    ])
  })
})
