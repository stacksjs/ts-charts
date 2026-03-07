import { describe, it, expect } from 'bun:test'
import { polygonArea } from '../src/index'

describe('polygonArea', () => {
  it('returns the expected value for closed counterclockwise polygons', () => {
    expect(polygonArea([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]])).toBe(1)
  })

  it('returns the expected value for closed clockwise polygons', () => {
    expect(polygonArea([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])).toBe(-1)
    expect(polygonArea([[1, 1], [3, 2], [2, 3], [1, 1]])).toBe(-1.5)
  })

  it('returns the expected value for open counterclockwise polygons', () => {
    expect(polygonArea([[0, 0], [0, 1], [1, 1], [1, 0]])).toBe(1)
  })

  it('returns the expected value for open clockwise polygons', () => {
    expect(polygonArea([[0, 0], [1, 0], [1, 1], [0, 1]])).toBe(-1)
    expect(polygonArea([[1, 1], [3, 2], [2, 3]])).toBe(-1.5)
  })

  it('returns the expected value for a very large polygon', () => {
    const stop = 1e8
    const step = 1e4
    const points: [number, number][] = []
    for (let value = 0; value < stop; value += step) points.push([0, value])
    for (let value = 0; value < stop; value += step) points.push([value, stop])
    for (let value = stop - step; value >= 0; value -= step) points.push([stop, value])
    for (let value = stop - step; value >= 0; value -= step) points.push([value, 0])
    expect(polygonArea(points)).toBe(1e16 - 5e7)
  })
})
