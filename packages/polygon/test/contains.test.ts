import { describe, it, expect } from 'bun:test'
import { polygonContains } from '../src/index'

describe('polygonContains', () => {
  it('returns the expected value for closed counterclockwise polygons', () => {
    expect(polygonContains([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], [0.5, 0.5])).toBe(true)
    expect(polygonContains([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], [1.5, 0.5])).toBe(false)
    expect(polygonContains([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], [-0.5, 0.5])).toBe(false)
    expect(polygonContains([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], [0.5, 1.5])).toBe(false)
    expect(polygonContains([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], [0.5, -0.5])).toBe(false)
  })

  it('returns the expected value for closed clockwise polygons', () => {
    expect(polygonContains([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]], [0.5, 0.5])).toBe(true)
    expect(polygonContains([[1, 1], [3, 2], [2, 3], [1, 1]], [1.5, 1.5])).toBe(true)
  })

  it('returns the expected value for open counterclockwise polygons', () => {
    expect(polygonContains([[0, 0], [0, 1], [1, 1], [1, 0]], [0.5, 0.5])).toBe(true)
  })

  it('returns the expected value for open clockwise polygons', () => {
    expect(polygonContains([[0, 0], [1, 0], [1, 1], [0, 1]], [0.5, 0.5])).toBe(true)
    expect(polygonContains([[1, 1], [3, 2], [2, 3]], [1.5, 1.5])).toBe(true)
  })
})
