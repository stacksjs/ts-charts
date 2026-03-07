import { describe, expect, it } from 'bun:test'
import { timeFriday, timeFridays } from '../src/index.ts'
import { local } from './date.ts'

describe('timeFriday', () => {
  it('timeFridays in an alias for timeFriday.range', () => { expect(timeFridays).toBe(timeFriday.range) })
  it('timeFriday.floor(date) returns Fridays', () => {
    expect(timeFriday.floor(local(2011,  0,  5, 23, 59, 59))).toEqual(local(2010, 11, 31))
    expect(timeFriday.floor(local(2011,  0,  6,  0,  0,  0))).toEqual(local(2010, 11, 31))
    expect(timeFriday.floor(local(2011,  0,  6,  0,  0,  1))).toEqual(local(2010, 11, 31))
    expect(timeFriday.floor(local(2011,  0,  6, 23, 59, 59))).toEqual(local(2010, 11, 31))
    expect(timeFriday.floor(local(2011,  0,  7,  0,  0,  0))).toEqual(local(2011,  0,  7))
    expect(timeFriday.floor(local(2011,  0,  7,  0,  0,  1))).toEqual(local(2011,  0,  7))
  })
  it('timeFriday.count(start, end) counts Fridays after start (exclusive) and before end (inclusive)', () => {
    expect(timeFriday.count!(local(2012,  0,  1), local(2012,  0,  5))).toBe(0)
    expect(timeFriday.count!(local(2012,  0,  1), local(2012,  0,  6))).toBe(1)
    expect(timeFriday.count!(local(2012,  0,  1), local(2012,  0,  7))).toBe(1)
    expect(timeFriday.count!(local(2012,  0,  1), local(2012,  0, 13))).toBe(2)
    expect(timeFriday.count!(local(2010,  0,  1), local(2010,  0,  7))).toBe(0)
    expect(timeFriday.count!(local(2010,  0,  1), local(2010,  0,  8))).toBe(1)
    expect(timeFriday.count!(local(2010,  0,  1), local(2010,  0,  9))).toBe(1)
  })
  it('timeFriday.count(start, end) observes daylight saving', () => {
    expect(timeFriday.count!(local(2011,  0,  1), local(2011,  2, 13,  1))).toBe(10)
    expect(timeFriday.count!(local(2011,  0,  1), local(2011,  2, 13,  3))).toBe(10)
    expect(timeFriday.count!(local(2011,  0,  1), local(2011,  2, 13,  4))).toBe(10)
    expect(timeFriday.count!(local(2011,  0,  1), local(2011, 10,  6,  0))).toBe(44)
    expect(timeFriday.count!(local(2011,  0,  1), local(2011, 10,  6,  1))).toBe(44)
    expect(timeFriday.count!(local(2011,  0,  1), local(2011, 10,  6,  2))).toBe(44)
  })
})
