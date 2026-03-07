import { describe, expect, it } from 'bun:test'
import Delaunator from '../src/index.ts'

describe('Delaunator', () => {
  it('triangulates a simple set of points', () => {
    const points = new Float64Array([0, 0, 1, 0, 1, 1, 0, 1])
    const d = new Delaunator(points)
    expect(d.triangles.length).toBeGreaterThan(0)
    expect(d.triangles.length % 3).toBe(0)
    expect(d.hull.length).toBe(4)
  })

  it('triangulates from point objects', () => {
    const points = [[0, 0], [1, 0], [1, 1], [0, 1]]
    const d = Delaunator.from(points)
    expect(d.triangles.length).toBeGreaterThan(0)
    expect(d.hull.length).toBe(4)
  })

  it('handles collinear points', () => {
    const points = new Float64Array([0, 0, 1, 0, 2, 0, 3, 0])
    const d = new Delaunator(points)
    expect(d.triangles.length).toBe(0)
    expect(d.hull.length).toBeGreaterThan(0)
  })

  it('handles a larger set of points', () => {
    const n = 100
    const coords = new Float64Array(n * 2)
    for (let i = 0; i < n; i++) {
      coords[2 * i] = Math.cos((2 * Math.PI * i) / n)
      coords[2 * i + 1] = Math.sin((2 * Math.PI * i) / n)
    }
    const d = new Delaunator(coords)
    expect(d.triangles.length).toBeGreaterThan(0)
    expect(d.halfedges.length).toBe(d.triangles.length)
  })
})
