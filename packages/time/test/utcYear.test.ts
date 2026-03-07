import { describe, expect, it } from 'bun:test'
import { utcYear } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcYear', () => {
  it('utcYear.floor(date) returns years', () => {
    expect(utcYear.floor(utc(2010, 11, 31, 23, 59, 59))).toEqual(utc(2010,  0,  1))
    expect(utcYear.floor(utc(2011,  0,  1,  0,  0,  0))).toEqual(utc(2011,  0,  1))
    expect(utcYear.floor(utc(2011,  0,  1,  0,  0,  1))).toEqual(utc(2011,  0,  1))
  })
  it('utcYear.floor(date) does not modify the specified date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59)
    expect(utcYear.floor(d)).toEqual(utc(2010,  0,  1))
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59))
  })
  it('utcYear.floor(date) correctly handles years in the first century', () => {
    expect(utcYear.floor(utc(9, 10,  6,  7))).toEqual(utc(9,  0,  1))
  })
  it('utcYear.ceil(date) returns years', () => {
    expect(utcYear.ceil(utc(2010, 11, 31, 23, 59, 59))).toEqual(utc(2011,  0,  1))
    expect(utcYear.ceil(utc(2011,  0,  1,  0,  0,  0))).toEqual(utc(2011,  0,  1))
    expect(utcYear.ceil(utc(2011,  0,  1,  0,  0,  1))).toEqual(utc(2012,  0,  1))
  })
  it('utcYear.offset(date, count) does not modify the passed-in date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59, 999)
    utcYear.offset(d, +1)
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
  })
  it('utcYear.offset(date, count) does not round the passed-in-date', () => {
    expect(utcYear.offset(utc(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(utc(2011, 11, 31, 23, 59, 59, 999))
    expect(utcYear.offset(utc(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(utc(2008, 11, 31, 23, 59, 59, 456))
  })
  it('utcYear.offset(date, count) allows negative offsets', () => {
    expect(utcYear.offset(utc(2010, 11,  1), -1)).toEqual(utc(2009, 11,  1))
    expect(utcYear.offset(utc(2011,  0,  1), -2)).toEqual(utc(2009,  0,  1))
    expect(utcYear.offset(utc(2011,  0,  1), -1)).toEqual(utc(2010,  0,  1))
  })
  it('utcYear.offset(date, count) allows positive offsets', () => {
    expect(utcYear.offset(utc(2009, 11,  1), +1)).toEqual(utc(2010, 11,  1))
    expect(utcYear.offset(utc(2009,  0,  1), +2)).toEqual(utc(2011,  0,  1))
    expect(utcYear.offset(utc(2010,  0,  1), +1)).toEqual(utc(2011,  0,  1))
  })
  it('utcYear.offset(date, count) allows zero offset', () => {
    expect(utcYear.offset(utc(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
    expect(utcYear.offset(utc(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(utc(2010, 11, 31, 23, 59, 58,   0))
  })
  it('utcYear.every(step) returns every stepth year, starting with year zero', () => {
    expect(utcYear.every!(5)!.range(utc(2008), utc(2023))).toEqual([utc(2010), utc(2015), utc(2020)])
  })
  it('utcYear.range(start, stop) returns years', () => {
    expect(utcYear.range(utc(2010, 0, 1), utc(2013, 0, 1))).toEqual([
      utc(2010, 0, 1),
      utc(2011, 0, 1),
      utc(2012, 0, 1),
    ])
  })
  it('utcYear.range(start, stop) has an inclusive lower bound', () => {
    expect(utcYear.range(utc(2010, 0, 1), utc(2013, 0, 1))[0]).toEqual(utc(2010, 0, 1))
  })
  it('utcYear.range(start, stop) has an exclusive upper bound', () => {
    expect(utcYear.range(utc(2010, 0, 1), utc(2013, 0, 1))[2]).toEqual(utc(2012, 0, 1))
  })
  it('utcYear.range(start, stop, step) can skip years', () => {
    expect(utcYear.range(utc(2009, 0, 1), utc(2029, 0, 1), 5)).toEqual([
      utc(2009, 0, 1),
      utc(2014, 0, 1),
      utc(2019, 0, 1),
      utc(2024, 0, 1),
    ])
  })
})
