import { describe, expect, it } from 'bun:test'
import { ascending } from '../src/index.ts'

it('ascending(a, b) returns a negative number if a < b', () => {
  expect(ascending(0, 1) < 0).toBe(true)
  expect(ascending('a', 'b') < 0).toBe(true)
})

it('ascending(a, b) returns a positive number if a > b', () => {
  expect(ascending(1, 0) > 0).toBe(true)
  expect(ascending('b', 'a') > 0).toBe(true)
})

it('ascending(a, b) returns zero if a >= b and a <= b', () => {
  expect(ascending(0, 0)).toBe(0)
  expect(ascending('a', 'a')).toBe(0)
  expect(ascending('0', 0)).toBe(0)
  expect(ascending(0, '0')).toBe(0)
})

it('ascending(a, b) returns NaN if a and b are not comparable', () => {
  expect(isNaN(ascending(0, undefined))).toBe(true)
  expect(isNaN(ascending(undefined, 0))).toBe(true)
  expect(isNaN(ascending(undefined, undefined))).toBe(true)
  expect(isNaN(ascending(0, NaN))).toBe(true)
  expect(isNaN(ascending(NaN, 0))).toBe(true)
  expect(isNaN(ascending(NaN, NaN))).toBe(true)
})
