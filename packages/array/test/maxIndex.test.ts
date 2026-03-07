import { describe, expect, it } from 'bun:test'
import { maxIndex } from '../src/index.ts'

it('maxIndex(array) returns the index of the greatest numeric value for numbers', () => {
  expect(maxIndex([1])).toBe(0)
  expect(maxIndex([5, 1, 2, 3, 4])).toBe(0)
  expect(maxIndex([20, 3])).toBe(0)
  expect(maxIndex([3, 20])).toBe(1)
})

it('maxIndex(array) returns -1 if the array contains no numbers', () => {
  expect(maxIndex([])).toBe(-1)
  expect(maxIndex([null])).toBe(-1)
  expect(maxIndex([undefined])).toBe(-1)
  expect(maxIndex([NaN])).toBe(-1)
  expect(maxIndex([NaN, NaN])).toBe(-1)
})

it('maxIndex(array) ignores null, undefined and NaN', () => {
  expect(maxIndex([NaN, 1, 2, 3, 4, 5])).toBe(5)
  expect(maxIndex([1, 2, 3, 4, 5, NaN])).toBe(4)
})

it('maxIndex(array, f) returns the index of the greatest numeric value', () => {
  expect(maxIndex([{v: 5}, {v: 1}, {v: 2}, {v: 3}, {v: 4}], (d: any) => d.v)).toBe(0)
  expect(maxIndex([{v: 3}, {v: 20}], (d: any) => d.v)).toBe(1)
})
