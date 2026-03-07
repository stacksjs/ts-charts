import { describe, expect, it } from 'bun:test'
import { scan } from '../src/index.ts'

it('scan(array) compares using natural order', () => {
  expect(scan([0, 1])).toBe(0)
  expect(scan([1, 0])).toBe(1)
  expect(scan([0, '1'])).toBe(0)
  expect(scan(['1', 0])).toBe(1)
})

it('scan(array) returns undefined if the array is empty', () => {
  expect(scan([])).toBe(undefined)
})

it('scan(array) returns undefined if the array contains only incomparable values', () => {
  expect(scan([NaN, undefined])).toBe(undefined)
})
