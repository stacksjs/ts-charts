import { describe, expect, it } from 'bun:test'
import { median } from '../src/index.ts'

it('median(array) returns the median value for numbers', () => {
  expect(median([1])).toBe(1)
  expect(median([5, 1, 2, 3])).toBe(2.5)
  expect(median([5, 1, 2, 3, 4])).toBe(3)
  expect(median([20, 3])).toBe(11.5)
  expect(median([3, 20])).toBe(11.5)
})

it('median(array) ignores null, undefined and NaN', () => {
  expect(median([NaN, 1, 2, 3, 4, 5])).toBe(3)
  expect(median([1, 2, 3, 4, 5, NaN])).toBe(3)
})

it('median(array) returns undefined if the array contains no numbers', () => {
  expect(median([])).toBe(undefined)
  expect(median([null])).toBe(undefined)
  expect(median([undefined])).toBe(undefined)
  expect(median([NaN])).toBe(undefined)
  expect(median([NaN, NaN])).toBe(undefined)
})

it('median(array, f) returns the median value for numbers', () => {
  expect(median([{v: 1}], (d: any) => d.v)).toBe(1)
  expect(median([{v: 5}, {v: 1}, {v: 2}, {v: 3}, {v: 4}], (d: any) => d.v)).toBe(3)
})
