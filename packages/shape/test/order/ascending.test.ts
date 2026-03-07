import { describe, it, expect } from 'bun:test'
import { stackOrderAscending } from '../../src/index.ts'

it('stackOrderAscending(series) returns an order by sum', () => {
  expect(stackOrderAscending([
    [[0, 1], [0, 2], [0, 3]],
    [[0, 2], [0, 3], [0, 4]],
    [[0, 0], [0, 1], [0, 2]],
  ] as any)).toEqual([2, 0, 1])
})

it('stackOrderAscending(series) treats NaN values as zero', () => {
  expect(stackOrderAscending([
    [[0, 1], [0, 2], [0, NaN], [0, 3]],
    [[0, 2], [0, 3], [0, NaN], [0, 4]],
    [[0, 0], [0, 1], [0, NaN], [0, 2]],
  ] as any)).toEqual([2, 0, 1])
})
