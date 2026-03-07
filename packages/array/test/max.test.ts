import { describe, expect, it } from 'bun:test'
import { max } from '../src/index.ts'

it('max(array) returns the greatest numeric value for numbers', () => {
  expect(max([1])).toBe(1)
  expect(max([5, 1, 2, 3, 4])).toBe(5)
  expect(max([20, 3])).toBe(20)
  expect(max([3, 20])).toBe(20)
})

it('max(array) returns the greatest lexicographic value for strings', () => {
  expect(max(['c', 'a', 'b'])).toBe('c')
  expect(max(['20', '3'])).toBe('3')
  expect(max(['3', '20'])).toBe('3')
})

it('max(array) ignores null, undefined and NaN', () => {
  expect(max([NaN, 1, 2, 3, 4, 5])).toBe(5)
  expect(max([1, 2, 3, 4, 5, NaN])).toBe(5)
  expect(max([10, null, 3, undefined, 5, NaN])).toBe(10)
  expect(max([-1, null, -3, undefined, -5, NaN])).toBe(-1)
})

it('max(array) returns undefined if the array contains no numbers', () => {
  expect(max([])).toBe(undefined)
  expect(max([null])).toBe(undefined)
  expect(max([undefined])).toBe(undefined)
  expect(max([NaN])).toBe(undefined)
  expect(max([NaN, NaN])).toBe(undefined)
})

it('max(array, f) returns the greatest numeric value for numbers', () => {
  expect(max([{v: 1}], (d: any) => d.v)).toBe(1)
  expect(max([{v: 5}, {v: 1}, {v: 2}, {v: 3}, {v: 4}], (d: any) => d.v)).toBe(5)
  expect(max([{v: 20}, {v: 3}], (d: any) => d.v)).toBe(20)
  expect(max([{v: 3}, {v: 20}], (d: any) => d.v)).toBe(20)
})

it('max(array, f) ignores null, undefined and NaN', () => {
  expect(max([{v: NaN}, {v: 1}, {v: 2}, {v: 3}, {v: 4}, {v: 5}], (d: any) => d.v)).toBe(5)
  expect(max([{v: 1}, {v: 2}, {v: 3}, {v: 4}, {v: 5}, {v: NaN}], (d: any) => d.v)).toBe(5)
  expect(max([{v: 10}, {v: null}, {v: 3}, {v: undefined}, {v: 5}, {v: NaN}], (d: any) => d.v)).toBe(10)
})
