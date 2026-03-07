import { describe, expect, it } from 'bun:test'
import { utcYear } from '../src/index.ts'
import { utc } from './date.ts'

describe('utcMultiYear', () => {
  it('utcYear.every(n).floor(date) returns integer multiples of n years', () => {
    expect(utcYear.every!(10)!.floor(utc(2009, 11, 31, 23, 59, 59))).toEqual(utc(2000,  0,  1))
    expect(utcYear.every!(10)!.floor(utc(2010,  0,  1,  0,  0,  0))).toEqual(utc(2010,  0,  1))
    expect(utcYear.every!(10)!.floor(utc(2010,  0,  1,  0,  0,  1))).toEqual(utc(2010,  0,  1))
  })
  it('utcYear.every(n).ceil(date) returns integer multiples of n years', () => {
    expect(utcYear.every!(100)!.ceil(utc(1999, 11, 31, 23, 59, 59))).toEqual(utc(2000,  0,  1))
    expect(utcYear.every!(100)!.ceil(utc(2000,  0,  1,  0,  0,  0))).toEqual(utc(2000,  0,  1))
    expect(utcYear.every!(100)!.ceil(utc(2000,  0,  1,  0,  0,  1))).toEqual(utc(2100,  0,  1))
  })
  it('utcYear.every(n).offset(date, count) does not modify the passed-in date', () => {
    const d = utc(2010, 11, 31, 23, 59, 59, 999)
    utcYear.every!(5)!.offset(d, +1)
    expect(d).toEqual(utc(2010, 11, 31, 23, 59, 59, 999))
  })
  it('utcYear.every(n).offset(date, count) does not round the passed-in-date', () => {
    expect(utcYear.every!(5)!.offset(utc(2010, 11, 31, 23, 59, 59, 999), +1)).toEqual(utc(2015, 11, 31, 23, 59, 59, 999))
    expect(utcYear.every!(5)!.offset(utc(2010, 11, 31, 23, 59, 59, 456), -2)).toEqual(utc(2000, 11, 31, 23, 59, 59, 456))
  })
  it('utcYear.every(n) does not define interval.count or interval.every', () => {
    const decade = utcYear.every!(10)!
    expect(decade.count).toBeUndefined()
    expect(decade.every).toBeUndefined()
  })
  it('utcYear.every(n).range(start, stop) returns multiples of n years', () => {
    expect(utcYear.every!(10)!.range(utc(2010, 0, 1), utc(2031, 0, 1))).toEqual([
      utc(2010, 0, 1), utc(2020, 0, 1), utc(2030, 0, 1),
    ])
  })
})
