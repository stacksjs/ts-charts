import { describe, expect, it } from 'bun:test'
import { zip } from '../src/index.ts'

it('zip() returns the empty array', () => {
  expect(zip()).toEqual([])
})

it('zip(a) returns [[a0], [a1], ...]', () => {
  expect(zip([1, 2, 3])).toEqual([[1], [2], [3]])
})

it('zip(a, b) returns [[a0, b0], [a1, b1], ...]', () => {
  expect(zip([1, 2], [3, 4])).toEqual([[1, 3], [2, 4]])
})

it('zip(a, b, c) returns [[a0, b0, c0], [a1, b1, c1], ...]', () => {
  expect(zip([1, 2, 3], [4, 5, 6], [7, 8, 9])).toEqual([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
})

it('zip pads to the shortest input', () => {
  expect(zip([1, 2], [3])).toEqual([[1, 3]])
})
