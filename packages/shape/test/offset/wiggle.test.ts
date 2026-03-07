import { describe, it, expect } from 'bun:test'
import { stackOffsetWiggle, stackOrderNone, stackOrderReverse } from '../../src/index.ts'

it('stackOffsetWiggle(series, order) minimizes weighted wiggle', () => {
  const series: any = [
    [[0, 1], [0, 2], [0, 1]],
    [[0, 3], [0, 4], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetWiggle(series, stackOrderNone(series))
  expect(series.map(roundSeries)).toEqual([
    [[0, 1], [-1, 1], [0.7857143, 1.7857143]],
    [[1, 4], [1, 5], [1.7857143, 3.7857143]],
    [[4, 9], [5, 7], [3.7857143, 7.7857143]],
  ].map(roundSeries))
})

it('stackOffsetWiggle(series, order) treats NaN as zero', () => {
  const series: any = [
    [[0, 1], [0, 2], [0, 1]],
    [[0, NaN], [0, NaN], [0, NaN]],
    [[0, 3], [0, 4], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetWiggle(series, stackOrderNone(series))
  expect(isNaN(series[1][0][1])).toBe(true)
  expect(isNaN(series[1][0][2])).toBe(true)
  expect(isNaN(series[1][0][3])).toBe(true)
  series[1][0][1] = series[1][1][1] = series[1][2][1] = 'NaN'
  expect(series.map(roundSeries)).toEqual([
    [[0, 1], [-1, 1], [0.7857143, 1.7857143]],
    [[1, 'NaN'], [1, 'NaN'], [1.7857143, 'NaN']],
    [[1, 4], [1, 5], [1.7857143, 3.7857143]],
    [[4, 9], [5, 7], [3.7857143, 7.7857143]],
  ].map(roundSeries))
})

it('stackOffsetWiggle(series, order) observes the specified order', () => {
  const series: any = [
    [[0, 1], [0, 2], [0, 1]],
    [[0, 3], [0, 4], [0, 2]],
    [[0, 5], [0, 2], [0, 4]],
  ]
  stackOffsetWiggle(series, stackOrderReverse(series))
  expect(series.map(roundSeries)).toEqual([
    [[8, 9], [8, 10], [7.21428571, 8.21428571]],
    [[5, 8], [4, 8], [5.21428571, 7.21428571]],
    [[0, 5], [2, 4], [1.21428571, 5.21428571]],
  ].map(roundSeries))
})

function roundSeries(series: any): any {
  return series.map(function (point: any) {
    return point.map(function (value: any) {
      return isNaN(value) ? value : Math.round(value * 1e6) / 1e6
    })
  })
}
