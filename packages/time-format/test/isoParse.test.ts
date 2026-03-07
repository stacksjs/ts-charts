import { describe, expect, it } from 'bun:test'
import { isoParse } from '../src/index.ts'
import { utc } from './date.ts'

describe('isoParse', () => {
  it('isoParse as ISO 8601', () => {
    expect(isoParse('1990-01-01T00:00:00.000Z')).toEqual(utc(1990, 0, 1, 0, 0, 0))
    expect(isoParse('2011-12-31T23:59:59.000Z')).toEqual(utc(2011, 11, 31, 23, 59, 59))
    expect(isoParse('1990-01-01T00:00:00.000X')).toBe(null)
  })
})
