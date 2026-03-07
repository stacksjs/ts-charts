import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

describe('quadtree.data', () => {
  it('quadtree.data() returns an array of data in the quadtree', () => {
    const q = quadtree()
    expect(q.data()).toEqual([])
    q.add([0, 0]).add([1, 2])
    expect(q.data()).toEqual([[0, 0], [1, 2]])
  })

  it('quadtree.data() correctly handles coincident nodes', () => {
    const q = quadtree()
    q.add([0, 0]).add([0, 0])
    expect(q.data()).toEqual([[0, 0], [0, 0]])
  })
})
