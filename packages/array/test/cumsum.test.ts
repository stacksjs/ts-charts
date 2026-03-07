import { describe, expect, it } from 'bun:test'
import { cumsum } from '../src/index.ts'

it('cumsum(array) returns the cumulative sum of the specified numbers', () => {
  expect(cumsum([1])).toEqual(new Float64Array([1]))
  expect(cumsum([5, 1, 2, 3, 4])).toEqual(new Float64Array([5, 6, 8, 11, 15]))
  expect(cumsum([20, 3])).toEqual(new Float64Array([20, 23]))
  expect(cumsum([3, 20])).toEqual(new Float64Array([3, 23]))
})

it('cumsum(array) observes values that can be coerced to numbers', () => {
  expect(cumsum(['20', '3'])).toEqual(new Float64Array([20, 23]))
  expect(cumsum(['3', '20'])).toEqual(new Float64Array([3, 23]))
})

it('cumsum(array) ignores non-numeric values', () => {
  expect(cumsum(['a', 'b', 'c'])).toEqual(new Float64Array([0, 0, 0]))
  expect(cumsum(['a', 1, '2'])).toEqual(new Float64Array([0, 1, 3]))
})

it('cumsum(array) ignores null, undefined and NaN', () => {
  expect(cumsum([NaN, 1, 2, 3, 4, 5])).toEqual(new Float64Array([0, 1, 3, 6, 10, 15]))
  expect(cumsum([1, 2, 3, 4, 5, NaN])).toEqual(new Float64Array([1, 3, 6, 10, 15, 15]))
  expect(cumsum([10, null, 3, undefined, 5, NaN])).toEqual(new Float64Array([10, 10, 13, 13, 18, 18]))
})

it('cumsum(array, f) returns the cumulative sum of the specified numbers', () => {
  expect(cumsum([{v:1}], (d: any) => d.v)).toEqual(new Float64Array([1]))
  expect(cumsum([{v:5}, {v:1}, {v:2}, {v:3}, {v:4}], (d: any) => d.v)).toEqual(new Float64Array([5, 6, 8, 11, 15]))
})

it('cumsum(array, f) ignores non-numeric values', () => {
  expect(cumsum([{v:'a'}, {v:'b'}, {v:'c'}], (d: any) => d.v)).toEqual(new Float64Array([0, 0, 0]))
  expect(cumsum([{v:'a'}, {v:1}, {v:'2'}], (d: any) => d.v)).toEqual(new Float64Array([0, 1, 3]))
})
