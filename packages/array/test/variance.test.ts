import { describe, expect, it } from 'bun:test'
import { variance } from '../src/index.ts'

it('variance(array) returns the variance of the specified numbers', () => {
  expect(variance([5, 1, 2, 3, 4])).toBe(2.5)
  expect(variance([20, 3])).toBe(144.5)
  expect(variance([3, 20])).toBe(144.5)
})

it('variance(array) ignores null, undefined and NaN', () => {
  expect(variance([NaN, 1, 2, 3, 4, 5])).toBe(2.5)
  expect(variance([1, 2, 3, 4, 5, NaN])).toBe(2.5)
})

it('variance(array) can handle large numbers without overflowing', () => {
  expect(variance([Number.MAX_VALUE, Number.MAX_VALUE])).toBe(0)
})

it('variance(array) returns undefined if the array has fewer than two numbers', () => {
  expect(variance([1])).toBe(undefined)
  expect(variance([])).toBe(undefined)
  expect(variance([null])).toBe(undefined)
  expect(variance([undefined])).toBe(undefined)
  expect(variance([NaN])).toBe(undefined)
  expect(variance([NaN, NaN])).toBe(undefined)
})
