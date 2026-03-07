import { describe, expect, it } from 'bun:test'
import { min } from '../src/index.ts'

it('min(array) returns the least numeric value for numbers', () => {
  expect(min([1])).toBe(1)
  expect(min([5, 1, 2, 3, 4])).toBe(1)
  expect(min([20, 3])).toBe(3)
  expect(min([3, 20])).toBe(3)
})

it('min(array) returns the least lexicographic value for strings', () => {
  expect(min(['c', 'a', 'b'])).toBe('a')
  expect(min(['20', '3'])).toBe('20')
  expect(min(['3', '20'])).toBe('20')
})

it('min(array) ignores null, undefined and NaN', () => {
  expect(min([NaN, 1, 2, 3, 4, 5])).toBe(1)
  expect(min([1, 2, 3, 4, 5, NaN])).toBe(1)
  expect(min([10, null, 3, undefined, 5, NaN])).toBe(3)
  expect(min([-1, null, -3, undefined, -5, NaN])).toBe(-5)
})

it('min(array) returns undefined if the array contains no numbers', () => {
  expect(min([])).toBe(undefined)
  expect(min([null])).toBe(undefined)
  expect(min([undefined])).toBe(undefined)
  expect(min([NaN])).toBe(undefined)
  expect(min([NaN, NaN])).toBe(undefined)
})

it('min(array, f) returns the least numeric value for numbers', () => {
  expect(min([{v: 1}], (d: any) => d.v)).toBe(1)
  expect(min([{v: 5}, {v: 1}, {v: 2}, {v: 3}, {v: 4}], (d: any) => d.v)).toBe(1)
  expect(min([{v: 20}, {v: 3}], (d: any) => d.v)).toBe(3)
  expect(min([{v: 3}, {v: 20}], (d: any) => d.v)).toBe(3)
})
