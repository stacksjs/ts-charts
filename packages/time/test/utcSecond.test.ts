import { describe, expect, it } from 'bun:test'
import { utcSecond } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcSecond', () => {
  it('utcSecond.floor(date) returns seconds', () => {
    expect(utcSecond.floor(utc(2010, 11, 31, 23, 59, 59, 999))).toEqual(utc(2010, 11, 31, 23, 59, 59))
    expect(utcSecond.floor(utc(2011,  0,  1,  0,  0,  0,   0))).toEqual(utc(2011,  0,  1,  0,  0,  0))
    expect(utcSecond.floor(utc(2011,  0,  1,  0,  0,  0,   1))).toEqual(utc(2011,  0,  1,  0,  0,  0))
  })
  it('utcSecond.round(date) returns seconds', () => {
    expect(utcSecond.round(utc(2010, 11, 31, 23, 59, 59, 999))).toEqual(utc(2011,  0,  1,  0,  0,  0))
    expect(utcSecond.round(utc(2011,  0,  1,  0,  0,  0, 499))).toEqual(utc(2011,  0,  1,  0,  0,  0))
    expect(utcSecond.round(utc(2011,  0,  1,  0,  0,  0, 500))).toEqual(utc(2011,  0,  1,  0,  0,  1))
  })
  it('utcSecond.ceil(date) returns seconds', () => {
    expect(utcSecond.ceil(utc(2010, 11, 31, 23, 59, 59, 999))).toEqual(utc(2011,  0,  1,  0,  0,  0))
    expect(utcSecond.ceil(utc(2011,  0,  1,  0,  0,  0,   0))).toEqual(utc(2011,  0,  1,  0,  0,  0))
    expect(utcSecond.ceil(utc(2011,  0,  1,  0,  0,  0,   1))).toEqual(utc(2011,  0,  1,  0,  0,  1))
  })
  it('utcSecond.offset(date, step) does not modify the passed-in date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59, 999)
    utcSecond.offset(d, +1)
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
  })
  it('utcSecond.offset(date, step) does not round the passed-in-date', () => {
    expect(utcSecond.offset(utc(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(utc(2011,  0,  1,  0,  0,  0, 999))
    expect(utcSecond.offset(utc(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(utc(2010, 11, 31, 23, 59, 57, 456))
  })
  it('utcSecond.offset(date, step) allows negative offsets', () => {
    expect(utcSecond.offset(utc(2010, 11, 31, 23, 59, 59), -1)).toEqual(utc(2010, 11, 31, 23, 59, 58))
    expect(utcSecond.offset(utc(2011,  0,  1,  0,  0,  0), -2)).toEqual(utc(2010, 11, 31, 23, 59, 58))
    expect(utcSecond.offset(utc(2011,  0,  1,  0,  0,  0), -1)).toEqual(utc(2010, 11, 31, 23, 59, 59))
  })
  it('utcSecond.offset(date, step) allows positive offsets', () => {
    expect(utcSecond.offset(utc(2010, 11, 31, 23, 59, 58), +1)).toEqual(utc(2010, 11, 31, 23, 59, 59))
    expect(utcSecond.offset(utc(2010, 11, 31, 23, 59, 58), +2)).toEqual(utc(2011,  0,  1,  0,  0,  0))
    expect(utcSecond.offset(utc(2010, 11, 31, 23, 59, 59), +1)).toEqual(utc(2011,  0,  1,  0,  0,  0))
  })
  it('utcSecond.offset(date, step) allows zero offset', () => {
    expect(utcSecond.offset(utc(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
    expect(utcSecond.offset(utc(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(utc(2010, 11, 31, 23, 59, 58,   0))
  })
  it('utcSecond.range(start, stop) returns seconds', () => {
    expect(utcSecond.range(utc(2010, 11, 31, 23, 59, 59), utc(2011, 0, 1, 0, 0, 2))).toEqual([
      utc(2010, 11, 31, 23, 59, 59),
      utc(2011, 0, 1, 0, 0, 0),
      utc(2011, 0, 1, 0, 0, 1),
    ])
  })
  it('utcSecond.range(start, stop) has an inclusive lower bound', () => {
    expect(utcSecond.range(utc(2010, 11, 31, 23, 59, 59), utc(2011, 0, 1, 0, 0, 2))[0]).toEqual(utc(2010, 11, 31, 23, 59, 59))
  })
  it('utcSecond.range(start, stop) has an exclusive upper bound', () => {
    expect(utcSecond.range(utc(2010, 11, 31, 23, 59, 59), utc(2011, 0, 1, 0, 0, 2))[2]).toEqual(utc(2011, 0, 1, 0, 0, 1))
  })
  it('utcSecond.range(start, stop, step) can skip seconds', () => {
    expect(utcSecond.range(utc(2011, 1, 1, 12, 0, 7), utc(2011, 1, 1, 12, 1, 7), 15)).toEqual([
      utc(2011, 1, 1, 12, 0, 7),
      utc(2011, 1, 1, 12, 0, 22),
      utc(2011, 1, 1, 12, 0, 37),
      utc(2011, 1, 1, 12, 0, 52),
    ])
  })
  it('utcSecond.range(start, stop) observes start of daylight savings time', () => {
    expect(utcSecond.range(utc(2011, 2, 13, 9, 59, 59), utc(2011, 2, 13, 10, 0, 2))).toEqual([
      utc(2011, 2, 13, 9, 59, 59),
      utc(2011, 2, 13, 10, 0, 0),
      utc(2011, 2, 13, 10, 0, 1),
    ])
  })
  it('utcSecond.range(start, stop) observes end of daylight savings time', () => {
    expect(utcSecond.range(utc(2011, 10, 6, 8, 59, 59), utc(2011, 10, 6, 9, 0, 2))).toEqual([
      utc(2011, 10, 6, 8, 59, 59),
      utc(2011, 10, 6, 9, 0, 0),
      utc(2011, 10, 6, 9, 0, 1),
    ])
  })
  it('utcSecond.every(step) returns every stepth second, starting with the first second of the minute', () => {
    expect(utcSecond.every!(15)!.range(utc(2008, 11, 30, 12, 36, 47), utc(2008, 11, 30, 12, 37, 57))).toEqual([utc(2008, 11, 30, 12, 37, 0), utc(2008, 11, 30, 12, 37, 15), utc(2008, 11, 30, 12, 37, 30), utc(2008, 11, 30, 12, 37, 45)])
    expect(utcSecond.every!(30)!.range(utc(2008, 11, 30, 12, 36, 47), utc(2008, 11, 30, 12, 37, 57))).toEqual([utc(2008, 11, 30, 12, 37, 0), utc(2008, 11, 30, 12, 37, 30)])
  })
})
