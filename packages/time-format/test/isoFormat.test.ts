import { describe, expect, it } from 'bun:test'
import { isoFormat } from '../src/index.ts'
import { utc } from './date.ts'

describe('isoFormat', () => {
  it('isoFormat(date) returns an ISO 8601 UTC string', () => {
    expect(isoFormat(utc(1990, 0, 1, 0, 0, 0))).toBe('1990-01-01T00:00:00.000Z')
    expect(isoFormat(utc(2011, 11, 31, 23, 59, 59))).toBe('2011-12-31T23:59:59.000Z')
  })
})
