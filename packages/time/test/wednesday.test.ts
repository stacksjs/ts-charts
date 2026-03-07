import { describe, expect, it } from 'bun:test'
import { timeWednesday, timeWednesdays } from '../src/index.ts'
import { local } from './date.ts'

describe('timeWednesday', () => {
  it('timeWednesdays in an alias for timeWednesday.range', () => { expect(timeWednesdays).toBe(timeWednesday.range) })
  it('timeWednesday.floor(date) returns Wednesdays', () => {
    expect(timeWednesday.floor(local(2011,  0,  3, 23, 59, 59))).toEqual(local(2010, 11, 29))
    expect(timeWednesday.floor(local(2011,  0,  4,  0,  0,  0))).toEqual(local(2010, 11, 29))
    expect(timeWednesday.floor(local(2011,  0,  4,  0,  0,  1))).toEqual(local(2010, 11, 29))
    expect(timeWednesday.floor(local(2011,  0,  4, 23, 59, 59))).toEqual(local(2010, 11, 29))
    expect(timeWednesday.floor(local(2011,  0,  5,  0,  0,  0))).toEqual(local(2011,  0,  5))
    expect(timeWednesday.floor(local(2011,  0,  5,  0,  0,  1))).toEqual(local(2011,  0,  5))
  })
  it('timeWednesday.count(start, end) counts Wednesdays after start (exclusive) and before end (inclusive)', () => {
    expect(timeWednesday.count!(local(2012,  0,  1), local(2012,  0,  3))).toBe(0)
    expect(timeWednesday.count!(local(2012,  0,  1), local(2012,  0,  4))).toBe(1)
    expect(timeWednesday.count!(local(2012,  0,  1), local(2012,  0,  5))).toBe(1)
    expect(timeWednesday.count!(local(2012,  0,  1), local(2012,  0, 11))).toBe(2)
    expect(timeWednesday.count!(local(2014,  0,  1), local(2014,  0,  7))).toBe(0)
    expect(timeWednesday.count!(local(2014,  0,  1), local(2014,  0,  8))).toBe(1)
    expect(timeWednesday.count!(local(2014,  0,  1), local(2014,  0,  9))).toBe(1)
  })
  it('timeWednesday.count(start, end) observes daylight saving', () => {
    expect(timeWednesday.count!(local(2011,  0,  1), local(2011,  2, 13,  1))).toBe(10)
    expect(timeWednesday.count!(local(2011,  0,  1), local(2011,  2, 13,  3))).toBe(10)
    expect(timeWednesday.count!(local(2011,  0,  1), local(2011,  2, 13,  4))).toBe(10)
    expect(timeWednesday.count!(local(2011,  0,  1), local(2011, 10,  6,  0))).toBe(44)
    expect(timeWednesday.count!(local(2011,  0,  1), local(2011, 10,  6,  1))).toBe(44)
    expect(timeWednesday.count!(local(2011,  0,  1), local(2011, 10,  6,  2))).toBe(44)
  })
})
