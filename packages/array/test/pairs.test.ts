import { describe, expect, it } from 'bun:test'
import { pairs } from '../src/index.ts'

it('pairs(array) returns the empty array if input has fewer than two elements', () => {
  expect(pairs([])).toEqual([])
  expect(pairs([1])).toEqual([])
})

it('pairs(array) returns pairs of adjacent elements', () => {
  expect(pairs([1, 2, 3, 4, 5])).toEqual([[1, 2], [2, 3], [3, 4], [4, 5]])
})

it('pairs(array, f) invokes the function for each pair of adjacent elements', () => {
  expect(pairs([1, 3, 6, 10], (a: any, b: any) => b - a)).toEqual([2, 3, 4])
})

it('pairs(array) includes null and undefined', () => {
  expect(pairs([1, null, 2])).toEqual([[1, null], [null, 2]])
  expect(pairs([1, 2, undefined])).toEqual([[1, 2], [2, undefined]])
})
