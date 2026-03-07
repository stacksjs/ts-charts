import { describe, it, expect } from 'bun:test'
import { contourDensity } from '../src/index.ts'

describe('contourDensity', () => {
  it('density.size(...) validates the specified size', () => {
    expect(contourDensity().size([1, 2]).size()).toEqual([1, 2])
    expect(contourDensity().size([0, 0]).size()).toEqual([0, 0])
    expect(contourDensity().size([1.5, 2.5]).size()).toEqual([1.5, 2.5])
    expect(() => void contourDensity().size([0, -1])).toThrow(/invalid size/)
  })

  it('contourDensity(data) returns the expected result for empty data', () => {
    const c = contourDensity()
    expect(c([])).toEqual([])
  })

  it('contourDensity.thresholds(values[])(data) returns contours for the given values', () => {
    const points = [[1, 0], [0, 1], [1, 1]]
    const c = contourDensity()
    const c1 = c(points)
    const values1 = c1.map((d: any) => d.value)
    const c2 = c.thresholds(values1)(points)
    const values2 = c2.map((d: any) => d.value)
    expect(values1).toEqual(values2)
  })

  it('contourDensity.weight(...) accepts NaN weights', () => {
    const points = [[1, 0, 1], [0, 1, -2], [1, 1, NaN]]
    const c = contourDensity().weight((d: any) => d[2])(points)
    expect(c.length).toBe(24)
  })

  it('contourDensity.thresholds(values[])(data) returns contours for the given values at a different cellSize', () => {
    const points = [[1, 0], [0, 1], [1, 1]]
    const c = contourDensity().cellSize(16)
    const c1 = c(points)
    const values1 = c1.map((d: any) => d.value)
    const c2 = c.thresholds(values1)(points)
    const values2 = c2.map((d: any) => d.value)
    expect(values1).toEqual(values2)
  })
})
