import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

describe('quadtree.cover', () => {
  it('quadtree.cover(x, y) sets a trivial extent if the extent was undefined', () => {
    expect(quadtree().cover(1, 2).extent()).toEqual([[1, 2], [2, 3]])
  })

  it('quadtree.cover(x, y) sets a non-trivial squarified and centered extent if the extent was trivial', () => {
    expect(quadtree().cover(0, 0).cover(1, 2).extent()).toEqual([[0, 0], [4, 4]])
  })

  it('quadtree.cover(x, y) ignores invalid points', () => {
    expect(quadtree().cover(0, 0).cover(NaN, 2).extent()).toEqual([[0, 0], [1, 1]])
  })

  it('quadtree.cover(x, y) repeatedly doubles the existing extent if the extent was non-trivial', () => {
    expect(quadtree().cover(0, 0).cover(2, 2).cover(-1, -1).extent()).toEqual([[-4, -4], [4, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(1, -1).extent()).toEqual([[0, -4], [8, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(3, -1).extent()).toEqual([[0, -4], [8, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(3, 1).extent()).toEqual([[0, 0], [4, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(3, 3).extent()).toEqual([[0, 0], [4, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(1, 3).extent()).toEqual([[0, 0], [4, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(-1, 3).extent()).toEqual([[-4, 0], [4, 8]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(-1, 1).extent()).toEqual([[-4, 0], [4, 8]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(-3, -3).extent()).toEqual([[-4, -4], [4, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(3, -3).extent()).toEqual([[0, -4], [8, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(5, -3).extent()).toEqual([[0, -4], [8, 4]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(5, 3).extent()).toEqual([[0, 0], [8, 8]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(5, 5).extent()).toEqual([[0, 0], [8, 8]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(3, 5).extent()).toEqual([[0, 0], [8, 8]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(-3, 5).extent()).toEqual([[-4, 0], [4, 8]])
    expect(quadtree().cover(0, 0).cover(2, 2).cover(-3, 3).extent()).toEqual([[-4, 0], [4, 8]])
  })

  it('quadtree.cover(x, y) repeatedly wraps the root node if it has children', () => {
    const q = quadtree().add([0, 0]).add([2, 2])
    expect(q.root()).toEqual([{ data: [0, 0] },,, { data: [2, 2] }])
    expect(q.copy().cover(3, 3).root()).toEqual([{ data: [0, 0] },,, { data: [2, 2] }])
    expect(q.copy().cover(-1, 3).root()).toEqual([, [{ data: [0, 0] },,, { data: [2, 2] }],,, ])
    expect(q.copy().cover(3, -1).root()).toEqual([,, [{ data: [0, 0] },,, { data: [2, 2] }],, ])
    expect(q.copy().cover(-1, -1).root()).toEqual([,,, [{ data: [0, 0] },,, { data: [2, 2] }]])
    expect(q.copy().cover(5, 5).root()).toEqual([[{ data: [0, 0] },,, { data: [2, 2] }],,,, ])
    expect(q.copy().cover(-3, 5).root()).toEqual([, [{ data: [0, 0] },,, { data: [2, 2] }],,, ])
    expect(q.copy().cover(5, -3).root()).toEqual([,, [{ data: [0, 0] },,, { data: [2, 2] }],, ])
    expect(q.copy().cover(-3, -3).root()).toEqual([,,, [{ data: [0, 0] },,, { data: [2, 2] }]])
  })

  it('quadtree.cover(x, y) does not wrap the root node if it is a leaf', () => {
    const q = quadtree().cover(0, 0).add([2, 2])
    expect(q.root()).toEqual({ data: [2, 2] })
    expect(q.copy().cover(3, 3).root()).toEqual({ data: [2, 2] })
    expect(q.copy().cover(-1, 3).root()).toEqual({ data: [2, 2] })
    expect(q.copy().cover(3, -1).root()).toEqual({ data: [2, 2] })
    expect(q.copy().cover(-1, -1).root()).toEqual({ data: [2, 2] })
    expect(q.copy().cover(5, 5).root()).toEqual({ data: [2, 2] })
    expect(q.copy().cover(-3, 5).root()).toEqual({ data: [2, 2] })
    expect(q.copy().cover(5, -3).root()).toEqual({ data: [2, 2] })
    expect(q.copy().cover(-3, -3).root()).toEqual({ data: [2, 2] })
  })

  it('quadtree.cover(x, y) does not wrap the root node if it is undefined', () => {
    const q = quadtree().cover(0, 0).cover(2, 2)
    expect(q.root()).toBe(undefined)
    expect(q.copy().cover(3, 3).root()).toBe(undefined)
    expect(q.copy().cover(-1, 3).root()).toBe(undefined)
    expect(q.copy().cover(3, -1).root()).toBe(undefined)
    expect(q.copy().cover(-1, -1).root()).toBe(undefined)
    expect(q.copy().cover(5, 5).root()).toBe(undefined)
    expect(q.copy().cover(-3, 5).root()).toBe(undefined)
    expect(q.copy().cover(5, -3).root()).toBe(undefined)
    expect(q.copy().cover(-3, -3).root()).toBe(undefined)
  })

  it('quadtree.cover() does not crash on huge values', () => {
    quadtree([[1e23, 0]])
  })
})
