import { describe, it, expect } from 'bun:test'
import { polygonCentroid } from '../src/index'

describe('polygonCentroid', () => {
  it('returns the expected value for closed counterclockwise polygons', () => {
    expect(polygonCentroid([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]])).toEqual([0.5, 0.5])
  })

  it('returns the expected value for closed clockwise polygons', () => {
    expect(polygonCentroid([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])).toEqual([0.5, 0.5])
    expect(polygonCentroid([[1, 1], [3, 2], [2, 3], [1, 1]])).toEqual([2, 2])
  })

  it('returns the expected value for open counterclockwise polygons', () => {
    expect(polygonCentroid([[0, 0], [0, 1], [1, 1], [1, 0]])).toEqual([0.5, 0.5])
  })

  it('returns the expected value for open clockwise polygons', () => {
    expect(polygonCentroid([[0, 0], [1, 0], [1, 1], [0, 1]])).toEqual([0.5, 0.5])
    expect(polygonCentroid([[1, 1], [3, 2], [2, 3]])).toEqual([2, 2])
  })

  it('returns the expected value for a very large polygon', () => {
    const stop = 1e8
    const step = 1e4
    const points: [number, number][] = []
    for (let value = 0; value < stop; value += step) points.push([0, value])
    for (let value = 0; value < stop; value += step) points.push([value, stop])
    for (let value = stop - step; value >= 0; value -= step) points.push([stop, value])
    for (let value = stop - step; value >= 0; value -= step) points.push([value, 0])
    expect(polygonCentroid(points)).toEqual([49999999.75000187, 49999999.75001216])
  })
})
