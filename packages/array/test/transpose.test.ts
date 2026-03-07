import { describe, expect, it } from 'bun:test'
import { transpose } from '../src/index.ts'

it('transpose([]) returns the empty array', () => {
  expect(transpose([])).toEqual([])
})

it('transpose([[a, b, ...], [c, d, ...]]) returns [[a, c], [b, d]]', () => {
  expect(transpose([[1, 2], [3, 4]])).toEqual([[1, 3], [2, 4]])
  expect(transpose([[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]])).toEqual([[1, 2], [2, 4], [3, 6], [4, 8], [5, 10]])
})

it('transpose([[a], [b]]) returns [[a, b]]', () => {
  expect(transpose([[1], [2]])).toEqual([[1, 2]])
})

it('transpose pads with undefined if input arrays have different lengths', () => {
  expect(transpose([[1, 2], [3]])).toEqual([[1, 3]])
})
