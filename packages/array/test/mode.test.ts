import { describe, expect, it } from 'bun:test'
import { mode } from '../src/index.ts'

it('mode(array) returns the value with the most occurrences', () => {
  expect(mode([1, 2, 2, 3])).toBe(2)
  expect(mode([1, 1, 1, 3])).toBe(1)
  expect(mode([3, 3])).toBe(3)
})

it('mode(array) ignores null, undefined and NaN', () => {
  expect(mode([NaN, 1, 2, 2, 3])).toBe(2)
  expect(mode([null, 1, 2, 2, 3])).toBe(2)
  expect(mode([undefined, 1, 2, 2, 3])).toBe(2)
})

it('mode(array) returns undefined if the array is empty', () => {
  expect(mode([])).toBe(undefined)
})

it('mode(array, f) returns the value with the most occurrences', () => {
  expect(mode([{v: 1}, {v: 2}, {v: 2}, {v: 3}], (d: any) => d.v)).toBe(2)
})
