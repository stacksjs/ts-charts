import { describe, it, expect } from 'bun:test'
import { stackOrderDescending } from '../../src/index.ts'

it('stackOrderDescending(series) returns an order by sum', () => {
  expect(stackOrderDescending([
    [[0, 1], [0, 2], [0, 3]],
    [[0, 2], [0, 3], [0, 4]],
    [[0, 0], [0, 1], [0, 2]],
  ] as any)).toEqual([1, 0, 2])
})

it('stackOrderDescending(series) treats NaN values as zero', () => {
  expect(stackOrderDescending([
    [[0, 1], [0, 2], [0, 3], [0, NaN]],
    [[0, 2], [0, 3], [0, 4], [0, NaN]],
    [[0, 0], [0, 1], [0, 2], [0, NaN]],
  ] as any)).toEqual([1, 0, 2])
})
