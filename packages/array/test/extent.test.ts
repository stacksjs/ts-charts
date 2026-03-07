import { describe, expect, it } from 'bun:test'
import { extent } from '../src/index.ts'

it('extent(array) returns the least and greatest numeric values for numbers', () => {
  expect(extent([1])).toEqual([1, 1])
  expect(extent([5, 1, 2, 3, 4])).toEqual([1, 5])
  expect(extent([20, 3])).toEqual([3, 20])
  expect(extent([3, 20])).toEqual([3, 20])
})

it('extent(array) returns the least and greatest lexicographic value for strings', () => {
  expect(extent(['c', 'a', 'b'])).toEqual(['a', 'c'])
  expect(extent(['20', '3'])).toEqual(['20', '3'])
  expect(extent(['3', '20'])).toEqual(['20', '3'])
})

it('extent(array) ignores null, undefined and NaN', () => {
  expect(extent([NaN, 1, 2, 3, 4, 5])).toEqual([1, 5])
  expect(extent([1, 2, 3, 4, 5, NaN])).toEqual([1, 5])
  expect(extent([10, null, 3, undefined, 5, NaN])).toEqual([3, 10])
  expect(extent([-1, null, -3, undefined, -5, NaN])).toEqual([-5, -1])
})

it('extent(array) returns [undefined, undefined] if the array contains no numbers', () => {
  expect(extent([])).toEqual([undefined, undefined])
  expect(extent([null])).toEqual([undefined, undefined])
  expect(extent([undefined])).toEqual([undefined, undefined])
  expect(extent([NaN])).toEqual([undefined, undefined])
  expect(extent([NaN, NaN])).toEqual([undefined, undefined])
})

it('extent(array) coerces values to numbers', () => {
  expect(extent(['1', '2'])).toEqual(['1', '2'])
})

it('extent(array, f) returns the least and greatest numeric value for numbers', () => {
  expect(extent([{v: 1}], (d: any) => d.v)).toEqual([1, 1])
  expect(extent([{v: 5}, {v: 1}, {v: 2}, {v: 3}, {v: 4}], (d: any) => d.v)).toEqual([1, 5])
  expect(extent([{v: 20}, {v: 3}], (d: any) => d.v)).toEqual([3, 20])
  expect(extent([{v: 3}, {v: 20}], (d: any) => d.v)).toEqual([3, 20])
})

it('extent(array, f) ignores null, undefined and NaN', () => {
  expect(extent([{v: NaN}, {v: 1}, {v: 2}, {v: 3}, {v: 4}, {v: 5}], (d: any) => d.v)).toEqual([1, 5])
  expect(extent([{v: 1}, {v: 2}, {v: 3}, {v: 4}, {v: 5}, {v: NaN}], (d: any) => d.v)).toEqual([1, 5])
  expect(extent([{v: 10}, {v: null}, {v: 3}, {v: undefined}, {v: 5}, {v: NaN}], (d: any) => d.v)).toEqual([3, 10])
})
