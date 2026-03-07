import { describe, it, expect } from 'bun:test'
import { polygonLength } from '../src/index'

describe('polygonLength', () => {
  it('returns the expected value for closed counterclockwise polygons', () => {
    expect(polygonLength([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]])).toBe(4)
  })

  it('returns the expected value for closed clockwise polygons', () => {
    expect(polygonLength([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])).toBe(4)
    expect(polygonLength([[1, 1], [3, 2], [2, 3], [1, 1]])).toBe(Math.sqrt(20) + Math.sqrt(2))
  })

  it('returns the expected value for open counterclockwise polygons', () => {
    expect(polygonLength([[0, 0], [0, 1], [1, 1], [1, 0]])).toBe(4)
  })

  it('returns the expected value for open clockwise polygons', () => {
    expect(polygonLength([[0, 0], [1, 0], [1, 1], [0, 1]])).toBe(4)
    expect(polygonLength([[1, 1], [3, 2], [2, 3]])).toBe(Math.sqrt(20) + Math.sqrt(2))
  })
})
