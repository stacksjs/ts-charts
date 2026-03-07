import { describe, expect, it } from 'bun:test'
import { timeYear } from '../src/index.ts'
import { local } from './date.ts'

describe('multiYear', () => {
  it('timeYear.every(n).floor(date) returns integer multiples of n years', () => {
    expect(timeYear.every!(10)!.floor(local(2009, 11, 31, 23, 59, 59))).toEqual(local(2000,  0,  1))
    expect(timeYear.every!(10)!.floor(local(2010,  0,  1,  0,  0,  0))).toEqual(local(2010,  0,  1))
    expect(timeYear.every!(10)!.floor(local(2010,  0,  1,  0,  0,  1))).toEqual(local(2010,  0,  1))
  })
  it('timeYear.every(n).ceil(date) returns integer multiples of n years', () => {
    expect(timeYear.every!(100)!.ceil(local(1999, 11, 31, 23, 59, 59))).toEqual(local(2000,  0,  1))
    expect(timeYear.every!(100)!.ceil(local(2000,  0,  1,  0,  0,  0))).toEqual(local(2000,  0,  1))
    expect(timeYear.every!(100)!.ceil(local(2000,  0,  1,  0,  0,  1))).toEqual(local(2100,  0,  1))
  })
  it('timeYear.every(n).offset(date, count) does not modify the passed-in date', () => {
    const d = local(2010, 11, 31, 23, 59, 59, 999)
    timeYear.every!(5)!.offset(d, +1)
    expect(d).toEqual(local(2010, 11, 31, 23, 59, 59, 999))
  })
  it('timeYear.every(n).offset(date, count) does not round the passed-in-date', () => {
    expect(timeYear.every!(5)!.offset(local(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(local(2015, 11, 31, 23, 59, 59, 999))
    expect(timeYear.every!(5)!.offset(local(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(local(2000, 11, 31, 23, 59, 59, 456))
  })
  it('timeYear.every(n) does not define interval.count or interval.every', () => {
    const decade = timeYear.every!(10)!
    expect(decade.count).toBeUndefined()
    expect(decade.every).toBeUndefined()
  })
  it('timeYear.every(n).range(start, stop) returns multiples of n years', () => {
    expect(timeYear.every!(10)!.range(local(2010, 0, 1), local(2031, 0, 1))).toEqual([
      local(2010, 0, 1), local(2020, 0, 1), local(2030, 0, 1),
    ])
  })
})
