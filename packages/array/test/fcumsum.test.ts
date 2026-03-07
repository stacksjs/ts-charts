import { describe, expect, it } from 'bun:test'
import { fcumsum } from '../src/index.ts'

function box(value: any): any { return { value } }
function unbox(box: any): any { return box.value }
function lastc(values: any, valueof?: any): number {
  const array = fcumsum(values, valueof)
  return array[array.length - 1]
}

it('fcumsum(array) returns a Float64Array of the expected length', () => {
  const A = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
  const R = fcumsum(A)
  expect(R instanceof Float64Array).toBe(true)
  expect(R.length).toBe(A.length)
})

it('fcumsum(array) is an exact cumsum', () => {
  expect(lastc([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1])).toBe(1)
  expect(lastc([0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3])).toBe(0)
})

it('fcumsum(array) returns the fsum of the specified numbers', () => {
  expect(lastc([1])).toBe(1)
  expect(lastc([5, 1, 2, 3, 4])).toBe(15)
  expect(lastc([20, 3])).toBe(23)
  expect(lastc([3, 20])).toBe(23)
})

it('fcumsum(array) observes values that can be coerced to numbers', () => {
  expect(lastc(['20', '3'])).toBe(23)
  expect(lastc(['3', '20'])).toBe(23)
})

it('fcumsum(array) ignores non-numeric values', () => {
  expect(lastc(['a', 'b', 'c'])).toBe(0)
  expect(lastc(['a', 1, '2'])).toBe(3)
})

it('fcumsum(array) ignores null, undefined and NaN', () => {
  expect(lastc([NaN, 1, 2, 3, 4, 5])).toBe(15)
  expect(lastc([1, 2, 3, 4, 5, NaN])).toBe(15)
  expect(lastc([10, null, 3, undefined, 5, NaN])).toBe(18)
})

it('fcumsum(array) returns an array of zeros if there are no numbers', () => {
  expect(Array.from(fcumsum([]))).toEqual([])
  expect(Array.from(fcumsum([NaN]))).toEqual([0])
  expect(Array.from(fcumsum([undefined]))).toEqual([0])
  expect(Array.from(fcumsum([undefined, NaN]))).toEqual([0, 0])
})

it('fcumsum(array, f) returns the fsum of the specified numbers', () => {
  expect(lastc([1].map(box), unbox)).toBe(1)
  expect(lastc([5, 1, 2, 3, 4].map(box), unbox)).toBe(15)
  expect(lastc([20, 3].map(box), unbox)).toBe(23)
  expect(lastc([3, 20].map(box), unbox)).toBe(23)
})

it('fcumsum(array, f) ignores non-numeric values', () => {
  expect(lastc(['a', 'b', 'c'].map(box), unbox)).toBe(0)
  expect(lastc(['a', 1, '2'].map(box), unbox)).toBe(3)
})

it('fcumsum(array, f) ignores null, undefined and NaN', () => {
  expect(lastc([NaN, 1, 2, 3, 4, 5].map(box), unbox)).toBe(15)
  expect(lastc([1, 2, 3, 4, 5, NaN].map(box), unbox)).toBe(15)
  expect(lastc([10, null, 3, undefined, 5, NaN].map(box), unbox)).toBe(18)
})
