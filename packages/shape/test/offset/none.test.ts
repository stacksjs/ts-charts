import { describe, it, expect } from 'bun:test'
import { stackOffsetNone, stackOrderNone, stackOrderReverse } from '../../src/index.ts'

it('stackOffsetNone(series, order) stacks upon the first layer\'s existing positions', () => {
  const series: any = [
    [[1, 2], [2, 4], [3, 4]],
    [[0, 3], [0, 4], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetNone(series, stackOrderNone(series))
  expect(series).toEqual([
    [[1, 2], [2, 4], [3, 4]],
    [[2, 5], [4, 8], [4, 6]],
    [[5, 10], [8, 10], [6, 10]],
  ])
})

it('stackOffsetNone(series, order) treats NaN as zero', () => {
  const series: any = [
    [[0, 1], [0, 2], [0, 1]],
    [[0, 3], [0, NaN], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetNone(series, stackOrderNone(series))
  expect(isNaN(series[1][1][1])).toBe(true)
  series[1][1][1] = 'NaN'
  expect(series).toEqual([
    [[0, 1], [0, 2], [0, 1]],
    [[1, 4], [2, 'NaN'], [1, 3]],
    [[4, 9], [2, 4], [3, 7]],
  ])
})

it('stackOffsetNone(series, order) observes the specified order', () => {
  const series: any = [
    [[0, 1], [0, 2], [0, 1]],
    [[0, 3], [0, 4], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetNone(series, stackOrderReverse(series))
  expect(series).toEqual([
    [[8, 9], [6, 8], [6, 7]],
    [[5, 8], [2, 6], [4, 6]],
    [[0, 5], [0, 2], [0, 4]],
  ])
})
