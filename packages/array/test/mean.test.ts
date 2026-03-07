import { describe, expect, it } from 'bun:test'
import { mean } from '../src/index.ts'

it('mean(array) returns the mean value for numbers', () => {
  expect(mean([1])).toBe(1)
  expect(mean([5, 1, 2, 3, 4])).toBe(3)
  expect(mean([20, 3])).toBe(11.5)
  expect(mean([3, 20])).toBe(11.5)
})

it('mean(array) ignores null, undefined and NaN', () => {
  expect(mean([NaN, 1, 2, 3, 4, 5])).toBe(3)
  expect(mean([1, 2, 3, 4, 5, NaN])).toBe(3)
  expect(mean([10, null, 3, undefined, 5, NaN])).toBe(6)
})

it('mean(array) returns undefined if the array contains no numbers', () => {
  expect(mean([])).toBe(undefined)
  expect(mean([null])).toBe(undefined)
  expect(mean([undefined])).toBe(undefined)
  expect(mean([NaN])).toBe(undefined)
  expect(mean([NaN, NaN])).toBe(undefined)
})

it('mean(array, f) returns the mean value for numbers', () => {
  expect(mean([{v: 1}], (d: any) => d.v)).toBe(1)
  expect(mean([{v: 5}, {v: 1}, {v: 2}, {v: 3}, {v: 4}], (d: any) => d.v)).toBe(3)
})

it('mean(array, f) ignores null, undefined and NaN', () => {
  expect(mean([{v: NaN}, {v: 1}, {v: 2}, {v: 3}, {v: 4}, {v: 5}], (d: any) => d.v)).toBe(3)
  expect(mean([{v: 1}, {v: 2}, {v: 3}, {v: 4}, {v: 5}, {v: NaN}], (d: any) => d.v)).toBe(3)
})
