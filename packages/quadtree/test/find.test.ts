import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

describe('quadtree.find', () => {
  it('quadtree.find(x, y) returns the closest point to the given [x, y]', () => {
    const dx = 17
    const dy = 17
    const q = quadtree()
    for (let i = 0, n = dx * dy; i < n; ++i) { q.add([i % dx, i / dx | 0]) }
    expect(q.find(0.1, 0.1)).toEqual([0, 0])
    expect(q.find(7.1, 7.1)).toEqual([7, 7])
    expect(q.find(0.1, 15.9)).toEqual([0, 16])
    expect(q.find(15.9, 15.9)).toEqual([16, 16])
  })

  it('quadtree.find(x, y, radius) returns the closest point within the search radius to the given [x, y]', () => {
    const q = quadtree([[0, 0], [100, 0], [0, 100], [100, 100]])
    expect(q.find(20, 20, Infinity)).toEqual([0, 0])
    expect(q.find(20, 20, 20 * Math.SQRT2 + 1e-6)).toEqual([0, 0])
    expect(q.find(20, 20, 20 * Math.SQRT2 - 1e-6)).toBe(undefined)
    expect(q.find(0, 20, 20 + 1e-6)).toEqual([0, 0])
    expect(q.find(0, 20, 20 - 1e-6)).toBe(undefined)
    expect(q.find(20, 0, 20 + 1e-6)).toEqual([0, 0])
    expect(q.find(20, 0, 20 - 1e-6)).toBe(undefined)
  })

  it('quadtree.find(x, y, null) treats the given radius as Infinity', () => {
    const q = quadtree([[0, 0], [100, 0], [0, 100], [100, 100]])
    expect(q.find(20, 20, null)).toEqual([0, 0])
    expect(q.find(20, 20, undefined)).toEqual([0, 0])
  })
})
