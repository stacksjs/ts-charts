import { describe, expect, it } from 'bun:test'
import { minIndex } from '../src/index.ts'

it('minIndex(array) returns the index of the least numeric value for numbers', () => {
  expect(minIndex([1])).toBe(0)
  expect(minIndex([5, 1, 2, 3, 4])).toBe(1)
  expect(minIndex([20, 3])).toBe(1)
  expect(minIndex([3, 20])).toBe(0)
})

it('minIndex(array) returns -1 if the array contains no numbers', () => {
  expect(minIndex([])).toBe(-1)
  expect(minIndex([null])).toBe(-1)
  expect(minIndex([undefined])).toBe(-1)
  expect(minIndex([NaN])).toBe(-1)
  expect(minIndex([NaN, NaN])).toBe(-1)
})

it('minIndex(array) ignores null, undefined and NaN', () => {
  expect(minIndex([NaN, 1, 2, 3, 4, 5])).toBe(1)
  expect(minIndex([1, 2, 3, 4, 5, NaN])).toBe(0)
})

it('minIndex(array, f) returns the index of the least numeric value', () => {
  expect(minIndex([{v: 5}, {v: 1}, {v: 2}, {v: 3}, {v: 4}], (d: any) => d.v)).toBe(1)
  expect(minIndex([{v: 3}, {v: 20}], (d: any) => d.v)).toBe(0)
})
