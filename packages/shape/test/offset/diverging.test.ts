import { describe, it, expect } from 'bun:test'
import { stackOffsetDiverging, stackOrderNone, stackOrderReverse } from '../../src/index.ts'

it('stackOffsetDiverging(series, order) applies a zero baseline, ignoring existing offsets', () => {
  const series: any = [
    [[1, 2], [2, 4], [3, 4]],
    [[0, 3], [0, 4], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetDiverging(series, stackOrderNone(series))
  expect(series).toEqual([
    [[0, 1], [0, 2], [0, 1]],
    [[1, 4], [2, 6], [1, 3]],
    [[4, 9], [6, 8], [3, 7]],
  ])
})

it('stackOffsetDiverging(series, order) handles a single series', () => {
  const series: any = [
    [[1, 2], [2, 4], [3, 4]],
  ]
  stackOffsetDiverging(series, stackOrderNone(series))
  expect(series).toEqual([
    [[0, 1], [0, 2], [0, 1]],
  ])
})

it('stackOffsetDiverging(series, order) treats NaN as zero', () => {
  const series: any = [
    [[0, 1], [0, 2], [0, 1]],
    [[0, 3], [0, NaN], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetDiverging(series, stackOrderNone(series))
  expect(isNaN(series[1][1][1])).toBe(true)
  series[1][1][1] = 'NaN'
  expect(series).toEqual([
    [[0, 1], [0, 2], [0, 1]],
    [[1, 4], [0, 'NaN'], [1, 3]],
    [[4, 9], [2, 4], [3, 7]],
  ])
})

it('stackOffsetDiverging(series, order) observes the specified order', () => {
  const series: any = [
    [[0, 1], [0, 2], [0, 1]],
    [[0, 3], [0, 4], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetDiverging(series, stackOrderReverse(series))
  expect(series).toEqual([
    [[8, 9], [6, 8], [6, 7]],
    [[5, 8], [2, 6], [4, 6]],
    [[0, 5], [0, 2], [0, 4]],
  ])
})

it('stackOffsetDiverging(series, order) puts negative values below zero, in order', () => {
  const series: any = [
    [[0, 1], [0, -2], [0, -1]],
    [[0, -3], [0, -4], [0, -2]],
    [[0, -5], [0, -2], [0, 4]],
  ]
  stackOffsetDiverging(series, stackOrderNone(series))
  expect(series).toEqual([
    [[0, 1], [-2, 0], [-1, 0]],
    [[-3, 0], [-6, -2], [-3, -1]],
    [[-8, -3], [-8, -6], [0, 4]],
  ])
})

it('stackOffsetDiverging(series, order) puts zero values at zero, in order', () => {
  const series: any = [
    [[0, 1], [0, 2], [0, -1]],
    [[0, 3], [0, 0], [0, 0]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetDiverging(series, stackOrderNone(series))
  expect(series).toEqual([
    [[0, 1], [0, 2], [-1, 0]],
    [[1, 4], [0, 0], [0, 0]],
    [[4, 9], [2, 4], [0, 4]],
  ])
})
