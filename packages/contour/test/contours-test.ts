import { describe, it, expect } from 'bun:test'
import { contours } from '../src/index.ts'

describe('contours', () => {
  it('contours(values) returns the expected result for an empty polygon', () => {
    const c = contours().size([10, 10]).thresholds([0.5])
    expect(c([
      // eslint-disable-next-line pickier/no-unused-vars
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
            // eslint-disable-next-line pickier/no-unused-vars
            [3.5, 3], [3, 3.5], [3, 4.5], [3, 5.5], [3, 6.5], [3, 7.5], [3.5, 8],
            // eslint-disable-next-line pickier/no-unused-vars
            [4.5, 8], [5.5, 8], [6, 7.5]]
          ]
        ]
      }
    ])
  })

  it('contours.size(...)  validates the specified size', () => {
    expect(contours().size([1, 2]).size()).toEqual([1, 2])
    expect(contours().size([0, 0]).size()).toEqual([0, 0])
    expect(contours().size([1.5, 2.5]).size()).toEqual([1, 2])
    expect(() => void contours().size([0, -1])).toThrow(/invalid size/)
  })

  it('contour(values, invalid value) throws an error', () => {
    for (const value of [NaN, null, undefined, 'a string']) {
      expect(() => contours().size([3, 3]).contour([1, 2, 3, 4, 5, 6, 7, 8, 9], value)).toThrow(/invalid value/)
    }
  })
})
