import { describe, expect, it } from 'bun:test'
import { sum } from '../src/index.ts'

it('sum(array) returns the sum of the specified numbers', () => {
  expect(sum([1])).toBe(1)
  expect(sum([5, 1, 2, 3, 4])).toBe(15)
  expect(sum([20, 3])).toBe(23)
  expect(sum([3, 20])).toBe(23)
})

it('sum(array) ignores non-numeric values', () => {
  expect(sum(['a', 'b', 'c'])).toBe(0)
  expect(sum(['a', 1, '2'])).toBe(3)
})

it('sum(array) ignores null, undefined and NaN', () => {
  expect(sum([NaN, 1, 2, 3, 4, 5])).toBe(15)
  expect(sum([1, 2, 3, 4, 5, NaN])).toBe(15)
  expect(sum([10, null, 3, undefined, 5, NaN])).toBe(18)
})

it('sum(array) returns 0 if the array is empty', () => {
  expect(sum([])).toBe(0)
})

it('sum(array, f) returns the sum of the specified numbers', () => {
  expect(sum([{v: 1}], (d: any) => d.v)).toBe(1)
  expect(sum([{v: 5}, {v: 1}, {v: 2}, {v: 3}, {v: 4}], (d: any) => d.v)).toBe(15)
})

it('sum(array, f) ignores NaN', () => {
  expect(sum([{v: NaN}, {v: 1}, {v: 2}], (d: any) => d.v)).toBe(3)
})
