import { describe, expect, it } from 'bun:test'
import { interpolateArray } from '../src/index.ts'

it('interpolateArray(a, b) interpolates defined elements in a and b', () => {
  expect(interpolateArray([2, 12], [4, 24])(0.5)).toEqual([3, 18])
})

it('interpolateArray(a, b) interpolates nested objects and arrays', () => {
  expect(interpolateArray([[2, 12]], [[4, 24]])(0.5)).toEqual([[3, 18]])
  expect(interpolateArray([{ foo: [2, 12] }], [{ foo: [4, 24] }])(0.5)).toEqual([{ foo: [3, 18] }])
})

it('interpolateArray(a, b) ignores elements in a that are not in b', () => {
  expect(interpolateArray([2, 12, 12], [4, 24])(0.5)).toEqual([3, 18])
})

it('interpolateArray(a, b) uses constant elements in b that are not in a', () => {
  expect(interpolateArray([2, 12], [4, 24, 12])(0.5)).toEqual([3, 18, 12])
})

it('interpolateArray(a, b) treats undefined as an empty array', () => {
  expect(interpolateArray(undefined, [2, 12])(0.5)).toEqual([2, 12])
  expect(interpolateArray([2, 12], undefined)(0.5)).toEqual([])
  expect(interpolateArray(undefined, undefined)(0.5)).toEqual([])
})

it('interpolateArray(a, b) interpolates array-like objects', () => {
  const array = new Float64Array(2)
  const args = (function () { return arguments } as any)(2, 12)
  array[0] = 2
  array[1] = 12
  expect(interpolateArray(array, [4, 24])(0.5)).toEqual([3, 18])
  expect(interpolateArray(args, [4, 24])(0.5)).toEqual([3, 18])
})

it('interpolateArray(a, b) gives exact ends for t=0 and t=1', () => {
  const a = [2e+42], b = [335]
  expect(interpolateArray(a, b)(1)).toEqual(b)
  expect(interpolateArray(a, b)(0)).toEqual(a)
})
