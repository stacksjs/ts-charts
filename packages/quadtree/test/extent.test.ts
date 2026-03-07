import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

describe('quadtree.extent', () => {
  it('quadtree.extent(extent) extends the extent', () => {
    expect(quadtree().extent([[0, 1], [2, 6]]).extent()).toEqual([[0, 1], [8, 9]])
  })

  it('quadtree.extent() can be inferred by quadtree.cover', () => {
    const q = quadtree()
    expect(q.cover(0, 0).extent()).toEqual([[0, 0], [1, 1]])
    expect(q.cover(2, 4).extent()).toEqual([[0, 0], [8, 8]])
  })

  it('quadtree.extent() can be inferred by quadtree.add', () => {
    const q = quadtree()
    q.add([0, 0])
    expect(q.extent()).toEqual([[0, 0], [1, 1]])
    q.add([2, 4])
    expect(q.extent()).toEqual([[0, 0], [8, 8]])
  })

  it('quadtree.extent(extent) squarifies and centers the specified extent', () => {
    expect(quadtree().extent([[0, 1], [2, 6]]).extent()).toEqual([[0, 1], [8, 9]])
  })

  it('quadtree.extent(extent) ignores invalid extents', () => {
    expect(quadtree().extent([[1, NaN], [NaN, 0]]).extent()).toBe(undefined)
    expect(quadtree().extent([[NaN, 1], [0, NaN]]).extent()).toBe(undefined)
    expect(quadtree().extent([[NaN, NaN], [NaN, NaN]]).extent()).toBe(undefined)
  })

  it('quadtree.extent(extent) flips inverted extents', () => {
    expect(quadtree().extent([[1, 1], [0, 0]]).extent()).toEqual([[0, 0], [2, 2]])
  })

  it('quadtree.extent(extent) tolerates partially-valid extents', () => {
    expect(quadtree().extent([[NaN, 0], [1, 1]]).extent()).toEqual([[1, 1], [2, 2]])
    expect(quadtree().extent([[0, NaN], [1, 1]]).extent()).toEqual([[1, 1], [2, 2]])
    expect(quadtree().extent([[0, 0], [NaN, 1]]).extent()).toEqual([[0, 0], [1, 1]])
    expect(quadtree().extent([[0, 0], [1, NaN]]).extent()).toEqual([[0, 0], [1, 1]])
  })

  it('quadtree.extent(extent) allows trivial extents', () => {
    expect(quadtree().extent([[0, 0], [0, 0]]).extent()).toEqual([[0, 0], [1, 1]])
    expect(quadtree().extent([[1, 1], [1, 1]]).extent()).toEqual([[1, 1], [2, 2]])
  })
})
