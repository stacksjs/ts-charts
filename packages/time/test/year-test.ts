import { describe, expect, it } from 'bun:test'
import { timeYear } from '../src/index.ts'
import { local } from './date.ts'

describe('timeYear', () => {
  it('timeYear.floor(date) returns years', () => {
    expect(timeYear.floor(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2010,  0,  1))
    expect(timeYear.floor(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2011,  0,  1))
    expect(timeYear.floor(local(2011,  0,  1,  0,  0,  1))).toEqual(local(2011,  0,  1))
  })

  it('timeYear.floor(date) does not modify the specified date', () => {
    const d = local(2010, 11, 31, 23, 59, 59)
    expect(timeYear.floor(d)).toEqual(local(2010,  0,  1))
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59))
  })

  it('timeYear.floor(date) correctly handles years in the first century', () => {
    expect(timeYear.floor(local(9, 10,  6,  7))).toEqual(local(9,  0,  1))
  })

  it('timeYear.ceil(date) returns years', () => {
    expect(timeYear.ceil(local(2010, 11, 31, 23, 59, 59))).toEqual(local(2011,  0,  1))
    expect(timeYear.ceil(local(2011,  0,  1,  0,  0,  0))).toEqual(local(2011,  0,  1))
    expect(timeYear.ceil(local(2011,  0,  1,  0,  0,  1))).toEqual(local(2012,  0,  1))
  })

  it('timeYear.offset(date, count) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeYear.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })

  it('timeYear.offset(date, count) does not round the passed-in-date', () => {
    expect(timeYear.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2011, 11, 31, 23, 59, 59, 999))
    expect(timeYear.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2008, 11, 31, 23, 59, 59, 456))
  })

  it('timeYear.offset(date, count) allows negative offsets', () => {
    expect(timeYear.offset(local(2010, 11,  1), -1)).toEqual(local(2009, 11,  1))
    expect(timeYear.offset(local(2011,  0,  1), -2)).toEqual(local(2009,  0,  1))
    expect(timeYear.offset(local(2011,  0,  1), -1)).toEqual(local(2010,  0,  1))
  })

  it('timeYear.offset(date, count) allows positive offsets', () => {
    expect(timeYear.offset(local(2009, 11,  1), +1)).toEqual(local(2010, 11,  1))
    expect(timeYear.offset(local(2009,  0,  1), +2)).toEqual(local(2011,  0,  1))
    expect(timeYear.offset(local(2010,  0,  1), +1)).toEqual(local(2011,  0,  1))
  })

  it('timeYear.offset(date, count) allows zero offset', () => {
    expect(timeYear.offset(local(2010, 11, 31, 23, 59, 59, 999), 0)).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
    expect(timeYear.offset(local(2010, 11, 31, 23, 59, 58,   0), 0)).toEqual(local(2010, 11, 31, 23, 59, 58,   0))
  })

  it('timeYear.every(step) returns every stepth year, starting with year zero', () => {
    expect(timeYear.every!(5)!.range(local(2008), local(2023))).toEqual([local(2010), local(2015), local(2020)])
  })

  it('timeYear.range(start, stop) returns years', () => {
    expect(timeYear.range(local(2010, 0, 1), local(2013, 0, 1))).toEqual([
      local(2010, 0, 1), local(2011, 0, 1), local(2012, 0, 1),
    ])
  })

  it('timeYear.range(start, stop) has an inclusive lower bound', () => {
    expect(timeYear.range(local(2010, 0, 1), local(2013, 0, 1))[0]).toEqual(local(2010, 0, 1))
  })

  it('timeYear.range(start, stop) has an exclusive upper bound', () => {
    expect(timeYear.range(local(2010, 0, 1), local(2013, 0, 1))[2]).toEqual(local(2012, 0, 1))
  })

  it('timeYear.range(start, stop, step) can skip years', () => {
    expect(timeYear.range(local(2009, 0, 1), local(2029, 0, 1), 5)).toEqual([
      local(2009, 0, 1), local(2014, 0, 1), local(2019, 0, 1), local(2024, 0, 1),
    ])
  })
})
