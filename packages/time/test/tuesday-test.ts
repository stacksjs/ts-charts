import { describe, expect, it } from 'bun:test'
import { timeTuesday, timeTuesdays } from '../src/index.ts'
import { local } from './date.ts'

describe('timeTuesday', () => {
  it('timeTuesdays in an alias for timeTuesday.range', () => { expect(timeTuesdays).toBe(timeTuesday.range) })
  it('timeTuesday.floor(date) returns Tuesdays', () => {
    expect(timeTuesday.floor(local(2011,  0,  2, 23, 59, 59))).toEqual(local(2010, 11, 28))
    expect(timeTuesday.floor(local(2011,  0,  3,  0,  0,  0))).toEqual(local(2010, 11, 28))
    expect(timeTuesday.floor(local(2011,  0,  3,  0,  0,  1))).toEqual(local(2010, 11, 28))
    expect(timeTuesday.floor(local(2011,  0,  3, 23, 59, 59))).toEqual(local(2010, 11, 28))
    expect(timeTuesday.floor(local(2011,  0,  4,  0,  0,  0))).toEqual(local(2011,  0,  4))
    expect(timeTuesday.floor(local(2011,  0,  4,  0,  0,  1))).toEqual(local(2011,  0,  4))
  })
  it('timeTuesday.count(start, end) counts Tuesdays after start (exclusive) and before end (inclusive)', () => {
    expect(timeTuesday.count!(local(2014,  0,  1), local(2014,  0,  6))).toBe(0)
    expect(timeTuesday.count!(local(2014,  0,  1), local(2014,  0,  7))).toBe(1)
    expect(timeTuesday.count!(local(2014,  0,  1), local(2014,  0,  8))).toBe(1)
    expect(timeTuesday.count!(local(2014,  0,  1), local(2014,  0, 14))).toBe(2)
    expect(timeTuesday.count!(local(2013,  0,  1), local(2013,  0,  7))).toBe(0)
    expect(timeTuesday.count!(local(2013,  0,  1), local(2013,  0,  8))).toBe(1)
    expect(timeTuesday.count!(local(2013,  0,  1), local(2013,  0,  9))).toBe(1)
  })
  it('timeTuesday.count(start, end) observes daylight saving', () => {
    expect(timeTuesday.count!(local(2011,  0,  1), local(2011,  2, 13,  1))).toBe(10)
    expect(timeTuesday.count!(local(2011,  0,  1), local(2011,  2, 13,  3))).toBe(10)
    expect(timeTuesday.count!(local(2011,  0,  1), local(2011,  2, 13,  4))).toBe(10)
    expect(timeTuesday.count!(local(2011,  0,  1), local(2011, 10,  6,  0))).toBe(44)
    expect(timeTuesday.count!(local(2011,  0,  1), local(2011, 10,  6,  1))).toBe(44)
    expect(timeTuesday.count!(local(2011,  0,  1), local(2011, 10,  6,  2))).toBe(44)
  })
})
