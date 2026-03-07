import { describe, expect, it } from 'bun:test'
import { timeSaturday, timeSaturdays } from '../src/index.ts'
import { local } from './date.ts'

describe('timeSaturday', () => {
  it('timeSaturdays in an alias for timeSaturday.range', () => { expect(timeSaturdays).toBe(timeSaturday.range) })
  it('timeSaturday.floor(date) returns Saturdays', () => {
    expect(timeSaturday.floor(local(2011,  0,  6, 23, 59, 59))).toEqual(local(2011,  0,  1))
    expect(timeSaturday.floor(local(2011,  0,  7,  0,  0,  0))).toEqual(local(2011,  0,  1))
    expect(timeSaturday.floor(local(2011,  0,  7,  0,  0,  1))).toEqual(local(2011,  0,  1))
    expect(timeSaturday.floor(local(2011,  0,  7, 23, 59, 59))).toEqual(local(2011,  0,  1))
    expect(timeSaturday.floor(local(2011,  0,  8,  0,  0,  0))).toEqual(local(2011,  0,  8))
    expect(timeSaturday.floor(local(2011,  0,  8,  0,  0,  1))).toEqual(local(2011,  0,  8))
  })
  it('timeSaturday.count(start, end) counts Saturdays after start (exclusive) and before end (inclusive)', () => {
    expect(timeSaturday.count!(local(2012,  0,  1), local(2012,  0,  6))).toBe(0)
    expect(timeSaturday.count!(local(2012,  0,  1), local(2012,  0,  7))).toBe(1)
    expect(timeSaturday.count!(local(2012,  0,  1), local(2012,  0,  8))).toBe(1)
    expect(timeSaturday.count!(local(2012,  0,  1), local(2012,  0, 14))).toBe(2)
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011,  0,  7))).toBe(0)
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011,  0,  8))).toBe(1)
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011,  0,  9))).toBe(1)
  })
  it('timeSaturday.count(start, end) observes daylight saving', () => {
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011,  2, 13,  1))).toBe(10)
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011,  2, 13,  3))).toBe(10)
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011,  2, 13,  4))).toBe(10)
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011, 10,  6,  0))).toBe(44)
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011, 10,  6,  1))).toBe(44)
    expect(timeSaturday.count!(local(2011,  0,  1), local(2011, 10,  6,  2))).toBe(44)
  })
})
