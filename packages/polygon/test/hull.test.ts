import { describe, it, expect } from 'bun:test'
import { polygonHull } from '../src/index'

describe('polygonHull', () => {
  it('returns null if points has fewer than three elements', () => {
    expect(polygonHull([])).toBeNull()
    expect(polygonHull([[0, 1]])).toBeNull()
    expect(polygonHull([[0, 1], [1, 0]])).toBeNull()
  })

  it('returns the convex hull of the specified points', () => {
    expect(polygonHull([[200, 200], [760, 300], [500, 500]])).toEqual([[760, 300], [200, 200], [500, 500]])
    expect(polygonHull([[200, 200], [760, 300], [500, 500], [400, 400]])).toEqual([[760, 300], [200, 200], [500, 500]])
  })

  it('handles points with duplicate ordinates', () => {
    expect(polygonHull([[-10, -10], [10, 10], [10, -10], [-10, 10]])).toEqual([[10, 10], [10, -10], [-10, -10], [-10, 10]])
  })

  it('handles overlapping upper and lower hulls', () => {
    expect(polygonHull([[0, -10], [0, 10], [0, 0], [10, 0], [-10, 0]])).toEqual([[10, 0], [0, -10], [-10, 0], [0, 10]])
  })

  it('handles various non-trivial hulls', () => {
    expect(polygonHull([[60, 20], [250, 140], [180, 170], [79, 140], [50, 60], [60, 20]])).toEqual([[250, 140], [60, 20], [50, 60], [79, 140], [180, 170]])
    expect(polygonHull([[50, 60], [60, 20], [70, 45], [100, 70], [125, 90], [200, 113], [250, 140], [180, 170], [105, 140], [79, 140], [60, 85], [50, 60]])).toEqual([[250, 140], [60, 20], [50, 60], [79, 140], [180, 170]])
    expect(polygonHull([[30, 30], [50, 60], [60, 20], [70, 45], [86, 39], [112, 60], [200, 113], [250, 50], [300, 200], [130, 240], [76, 150], [47, 76], [36, 40], [33, 35], [30, 30]])).toEqual([[300, 200], [250, 50], [60, 20], [30, 30], [47, 76], [76, 150], [130, 240]])
  })
})
