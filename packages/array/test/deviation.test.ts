import { describe, expect, it } from 'bun:test'
import { deviation } from '../src/index.ts'

function box(value: any): any { return { value } }
function unbox(box: any): any { return box.value }

it('deviation(array) returns the standard deviation of the specified numbers', () => {
  expect(deviation([1, 1, 1, 1, 1])).toBe(0)
  expect(deviation([5, 1, 2, 3, 4])).toBe(Math.sqrt(2.5))
  expect(deviation([20, 3])).toBe(Math.sqrt(144.5))
  expect(deviation([3, 20])).toBe(Math.sqrt(144.5))
})

it('deviation(array) ignores null, undefined and NaN', () => {
  expect(deviation([NaN, 1, 2, 3, 4, 5])).toBe(Math.sqrt(2.5))
  expect(deviation([1, 2, 3, 4, 5, NaN])).toBe(Math.sqrt(2.5))
  expect(deviation([10, null, 3, undefined, 5, NaN])).toBe(Math.sqrt(13))
})

it('deviation(array) can handle large numbers without overflowing', () => {
  expect(deviation([Number.MAX_VALUE, Number.MAX_VALUE])).toBe(0)
  expect(deviation([-Number.MAX_VALUE, -Number.MAX_VALUE])).toBe(0)
})

it('deviation(array) returns undefined if the array has fewer than two numbers', () => {
  expect(deviation([1])).toBe(undefined)
  expect(deviation([])).toBe(undefined)
  expect(deviation([null])).toBe(undefined)
  expect(deviation([undefined])).toBe(undefined)
  expect(deviation([NaN])).toBe(undefined)
  expect(deviation([NaN, NaN])).toBe(undefined)
})

it('deviation(array, f) returns the deviation of the specified numbers', () => {
  expect(deviation([5, 1, 2, 3, 4].map(box), unbox)).toBe(Math.sqrt(2.5))
  expect(deviation([20, 3].map(box), unbox)).toBe(Math.sqrt(144.5))
  expect(deviation([3, 20].map(box), unbox)).toBe(Math.sqrt(144.5))
})

it('deviation(array, f) ignores null, undefined and NaN', () => {
  expect(deviation([NaN, 1, 2, 3, 4, 5].map(box), unbox)).toBe(Math.sqrt(2.5))
  expect(deviation([1, 2, 3, 4, 5, NaN].map(box), unbox)).toBe(Math.sqrt(2.5))
  expect(deviation([10, null, 3, undefined, 5, NaN].map(box), unbox)).toBe(Math.sqrt(13))
})

it('deviation(array, f) can handle large numbers without overflowing', () => {
  expect(deviation([Number.MAX_VALUE, Number.MAX_VALUE].map(box), unbox)).toBe(0)
  expect(deviation([-Number.MAX_VALUE, -Number.MAX_VALUE].map(box), unbox)).toBe(0)
})

it('deviation(array, f) returns undefined if the array has fewer than two numbers', () => {
  expect(deviation([1].map(box), unbox)).toBe(undefined)
  expect(deviation(([] as any[]).map(box), unbox)).toBe(undefined)
  expect(deviation([null].map(box), unbox)).toBe(undefined)
  expect(deviation([undefined].map(box), unbox)).toBe(undefined)
  expect(deviation([NaN].map(box), unbox)).toBe(undefined)
  expect(deviation([NaN, NaN].map(box), unbox)).toBe(undefined)
})
