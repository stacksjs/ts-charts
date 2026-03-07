import { describe, it, expect } from 'bun:test'
import { stackOrderAppearance } from '../../src/index.ts'

it('stackOrderAppearance(series) returns an order by appearance', () => {
  expect(stackOrderAppearance([
    [[0, 0], [0, 0], [0, 1]],
    [[0, 3], [0, 2], [0, 0]],
    [[0, 0], [0, 4], [0, 0]],
  ] as any)).toEqual([1, 2, 0])
})

it('stackOrderAppearance(series) treats NaN values as zero', () => {
  expect(stackOrderAppearance([
    [[0, NaN], [0, NaN], [0, 1]],
    [[0, 3], [0, 2], [0, NaN]],
    [[0, NaN], [0, 4], [0, NaN]],
  ] as any)).toEqual([1, 2, 0])
})
