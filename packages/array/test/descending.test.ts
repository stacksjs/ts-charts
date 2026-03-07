import { describe, expect, it } from 'bun:test'
import { descending } from '../src/index.ts'

it('descending(a, b) returns a negative number if a > b', () => {
  expect(descending(1, 0) < 0).toBe(true)
  expect(descending('b', 'a') < 0).toBe(true)
})

it('descending(a, b) returns a positive number if a < b', () => {
  expect(descending(0, 1) > 0).toBe(true)
  expect(descending('a', 'b') > 0).toBe(true)
})

it('descending(a, b) returns zero if a >= b and a <= b', () => {
  expect(descending(0, 0)).toBe(0)
  expect(descending('a', 'a')).toBe(0)
  expect(descending('0', 0)).toBe(0)
  expect(descending(0, '0')).toBe(0)
})

it('descending(a, b) returns NaN if a and b are not comparable', () => {
  expect(isNaN(descending(0, undefined))).toBe(true)
  expect(isNaN(descending(undefined, 0))).toBe(true)
  expect(isNaN(descending(undefined, undefined))).toBe(true)
  expect(isNaN(descending(0, NaN))).toBe(true)
  expect(isNaN(descending(NaN, 0))).toBe(true)
  expect(isNaN(descending(NaN, NaN))).toBe(true)
})
