import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

describe('quadtree.size', () => {
  it('quadtree.size() returns the number of points in the quadtree', () => {
    const q = quadtree()
    expect(q.size()).toBe(0)
    q.add([0, 0]).add([1, 2])
    expect(q.size()).toBe(2)
  })

  it('quadtree.size() correctly counts coincident nodes', () => {
    const q = quadtree()
    q.add([0, 0]).add([0, 0])
    expect(q.size()).toBe(2)
  })
})
