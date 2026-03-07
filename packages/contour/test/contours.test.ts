import { describe, it, expect } from 'bun:test'
import { contours } from '../src/index.ts'

describe('contours', () => {
  it('contours(values) returns the expected result for an empty polygon', () => {
    const c = contours().size([10, 10]).thresholds([0.5])
    expect(c([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ])).toEqual([
      {
        type: 'MultiPolygon',
        value: 0.5,
        coordinates: []
      }
    ])
  })

  it('contours(values) returns the expected result for a simple polygon', () => {
    const c = contours().size([10, 10]).thresholds([0.5])
    expect(c([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ])).toEqual([
      {
        type: 'MultiPolygon',
        value: 0.5,
        coordinates: [
          [
            [[6, 7.5], [6, 6.5], [6, 5.5], [6, 4.5], [6, 3.5], [5.5, 3], [4.5, 3],
             [3.5, 3], [3, 3.5], [3, 4.5], [3, 5.5], [3, 6.5], [3, 7.5], [3.5, 8],
             [4.5, 8], [5.5, 8], [6, 7.5]]
          ]
        ]
      }
    ])
  })

  it('contours(values).contour(value) returns the expected result for a simple polygon', () => {
    const c = contours().size([10, 10])
    expect(c.contour([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ], 0.5)).toEqual({
      type: 'MultiPolygon',
      value: 0.5,
      coordinates: [
        [
          [[6, 7.5], [6, 6.5], [6, 5.5], [6, 4.5], [6, 3.5], [5.5, 3], [4.5, 3],
           [3.5, 3], [3, 3.5], [3, 4.5], [3, 5.5], [3, 6.5], [3, 7.5], [3.5, 8],
           [4.5, 8], [5.5, 8], [6, 7.5]]
        ]
      ]
    })
  })

  it('contours.smooth(false)(values) returns the expected result for a simple polygon', () => {
    const c = contours().smooth(false).size([10, 10]).thresholds([0.5])
    expect(c([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 2, 1, 2, 0, 0, 0, 0,
      0, 0, 0, 2, 2, 2, 0, 0, 0, 0,
      0, 0, 0, 1, 2, 1, 0, 0, 0, 0,
      0, 0, 0, 2, 2, 2, 0, 0, 0, 0,
      0, 0, 0, 2, 1, 2, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ])).toEqual([
      {
        type: 'MultiPolygon',
        value: 0.5,
        coordinates: [
          [
            [[6, 7.5], [6, 6.5], [6, 5.5], [6, 4.5], [6, 3.5], [5.5, 3], [4.5, 3],
             [3.5, 3], [3, 3.5], [3, 4.5], [3, 5.5], [3, 6.5], [3, 7.5], [3.5, 8],
             [4.5, 8], [5.5, 8], [6, 7.5]]
          ]
        ]
      }
    ])
  })

  it('contours(values) returns the expected result for a polygon with a hole', () => {
    const c = contours().size([10, 10]).thresholds([0.5])
    expect(c([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 0, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 0, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 0, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ])).toEqual([
      {
        type: 'MultiPolygon',
        value: 0.5,
        coordinates: [
          [
            [[6, 7.5], [6, 6.5], [6, 5.5], [6, 4.5], [6, 3.5], [5.5, 3], [4.5, 3],
             [3.5, 3], [3, 3.5], [3, 4.5], [3, 5.5], [3, 6.5], [3, 7.5], [3.5, 8],
             [4.5, 8], [5.5, 8], [6, 7.5]],
            [[4.5, 7], [4, 6.5], [4, 5.5], [4, 4.5], [4.5, 4], [5, 4.5], [5, 5.5],
             [5, 6.5], [4.5, 7]]
          ]
        ]
      }
    ])
  })

  it('contours(values) returns the expected result for a multipolygon', () => {
    const c = contours().size([10, 10]).thresholds([0.5])
    expect(c([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 0, 1, 0, 0, 0,
      0, 0, 0, 1, 1, 0, 1, 0, 0, 0,
      0, 0, 0, 1, 1, 0, 1, 0, 0, 0,
      0, 0, 0, 1, 1, 0, 1, 0, 0, 0,
      0, 0, 0, 1, 1, 0, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ])).toEqual([
      {
        type: 'MultiPolygon',
        value: 0.5,
        coordinates: [
          [
            [[5, 7.5], [5, 6.5], [5, 5.5], [5, 4.5], [5, 3.5], [4.5, 3], [3.5, 3],
             [3, 3.5], [3, 4.5], [3, 5.5], [3, 6.5], [3, 7.5], [3.5, 8], [4.5, 8],
             [5, 7.5]]
          ],
          [
            [[7, 7.5], [7, 6.5], [7, 5.5], [7, 4.5], [7, 3.5], [6.5, 3], [6, 3.5],
             [6, 4.5], [6, 5.5], [6, 6.5], [6, 7.5], [6.5, 8], [7, 7.5]]
          ]
        ]
      }
    ])
  })

  it('contours.size(...) validates the specified size', () => {
    expect(contours().size([1, 2]).size()).toEqual([1, 2])
    expect(contours().size([0, 0]).size()).toEqual([0, 0])
    expect(contours().size([1.5, 2.5]).size()).toEqual([1, 2])
    expect(() => void contours().size([0, -1])).toThrow(/invalid size/)
  })

  it('contours(values) returns the expected thresholds', () => {
    const c = contours().size([10, 10]).thresholds(20)
    expect(c([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 0, 1, 1, 1, 0, 0,
      0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
      0, 1, 1, 1, 0, 1, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]).map(d => d.value)).toEqual([0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95])
  })

  it('contours(values) ignores infinite values when computing the thresholds', () => {
    const c = contours().size([10, 10]).thresholds(20)
    expect(c([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, -Infinity, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 0, 1, 1, 1, 0, 0,
      0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
      0, 1, 1, 1, 0, 1, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, Infinity, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]).map(d => d.value)).toEqual([0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95])
  })

  it('contours(values) returns the expected result for a +Infinity value', () => {
    const c = contours().size([10, 10]).thresholds([0.5])
    expect(c([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, +Infinity, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 1, +Infinity, 1, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ])).toEqual([
      {
        type: 'MultiPolygon',
        value: 0.5,
        coordinates: [
          [
            [[6, 7.5], [6, 6.5], [6, 5.5], [6, 4.5], [6, 3.5], [5.5, 3], [4.5, 3],
             [3.5, 3], [3, 3.5], [3, 4.5], [3, 5.5], [3, 6.5], [3, 7.5], [3.5, 8],
             [4.5, 8], [5.5, 8], [6, 7.5]]
          ]
        ]
      }
    ])
  })

  it('contour(values, invalid value) throws an error', () => {
    for (const value of [NaN, null, undefined, 'a string']) {
      expect(() => contours().size([3, 3]).contour([1, 2, 3, 4, 5, 6, 7, 8, 9], value)).toThrow(/invalid value/)
    }
  })

  it('contours(values) uses the expected nice thresholds', () => {
    expect(contours().size([2, 1]).thresholds(14)([-149.76192742819748, 321.19300631539585]).map((c: any) => c.value)).toEqual([-150, -100, -50, 0, 50, 100, 150, 200, 250, 300])
    expect(contours().size([2, 1]).thresholds(5)([-149.76192742819748, 321.19300631539585]).map((c: any) => c.value)).toEqual([-200, -100, 0, 100, 200, 300])
    expect(contours().size([2, 1]).thresholds(14)([149.76192742819748, -321.19300631539585]).map((c: any) => c.value)).toEqual([-350, -300, -250, -200, -150, -100, -50, 0, 50, 100])
    expect(contours().size([2, 1]).thresholds(5)([149.76192742819748, -321.19300631539585]).map((c: any) => c.value)).toEqual([-400, -300, -200, -100, 0, 100])
    expect(contours().size([2, 1]).thresholds(12)([-29, 50]).map((c: any) => c.value)).toEqual([-30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45])
    expect(contours().size([2, 1]).thresholds(10)([-41, 245]).map((c: any) => c.value)).toEqual([-50, 0, 50, 100, 150, 200])
    expect(contours().size([2, 1]).thresholds(9)([-22, 242]).map((c: any) => c.value)).toEqual([-50, 0, 50, 100, 150, 200])
  })
})
