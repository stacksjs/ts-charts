import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

describe('quadtree.add', () => {
  it('quadtree.add(datum) creates a new point and adds it to the quadtree', () => {
    const q = quadtree()
    expect(q.add([0.0, 0.0]).root()).toEqual({ data: [0, 0] })
    expect(q.add([0.9, 0.9]).root()).toEqual([{ data: [0, 0] },,, { data: [0.9, 0.9] }])
    expect(q.add([0.9, 0.0]).root()).toEqual([{ data: [0, 0] }, { data: [0.9, 0] },, { data: [0.9, 0.9] }])
    expect(q.add([0.0, 0.9]).root()).toEqual([{ data: [0, 0] }, { data: [0.9, 0] }, { data: [0, 0.9] }, { data: [0.9, 0.9] }])
    expect(q.add([0.4, 0.4]).root()).toEqual([[{ data: [0, 0] },,, { data: [0.4, 0.4] }], { data: [0.9, 0] }, { data: [0, 0.9] }, { data: [0.9, 0.9] }])
  })

  it('quadtree.add(datum) handles points being on the perimeter of the quadtree bounds', () => {
    const q = quadtree().extent([[0, 0], [1, 1]])
    expect(q.add([0, 0]).root()).toEqual({ data: [0, 0] })
    expect(q.add([1, 1]).root()).toEqual([{ data: [0, 0] },,, { data: [1, 1] }])
    expect(q.add([1, 0]).root()).toEqual([{ data: [0, 0] }, { data: [1, 0] },, { data: [1, 1] }])
    expect(q.add([0, 1]).root()).toEqual([{ data: [0, 0] }, { data: [1, 0] }, { data: [0, 1] }, { data: [1, 1] }])
  })

  it('quadtree.add(datum) handles points being to the top of the quadtree bounds', () => {
    const q = quadtree().extent([[0, 0], [2, 2]])
    expect(q.add([1, -1]).extent()).toEqual([[0, -4], [8, 4]])
  })

  it('quadtree.add(datum) handles points being to the right of the quadtree bounds', () => {
    const q = quadtree().extent([[0, 0], [2, 2]])
    expect(q.add([3, 1]).extent()).toEqual([[0, 0], [4, 4]])
  })

  it('quadtree.add(datum) handles points being to the bottom of the quadtree bounds', () => {
    const q = quadtree().extent([[0, 0], [2, 2]])
    expect(q.add([1, 3]).extent()).toEqual([[0, 0], [4, 4]])
  })

  it('quadtree.add(datum) handles points being to the left of the quadtree bounds', () => {
    const q = quadtree().extent([[0, 0], [2, 2]])
    expect(q.add([-1, 1]).extent()).toEqual([[-4, 0], [4, 8]])
  })

  it('quadtree.add(datum) handles coincident points by creating a linked list', () => {
    const q = quadtree().extent([[0, 0], [1, 1]])
    expect(q.add([0, 0]).root()).toEqual({ data: [0, 0] })
    expect(q.add([1, 0]).root()).toEqual([{ data: [0, 0] }, { data: [1, 0] },,, ])
    expect(q.add([0, 1]).root()).toEqual([{ data: [0, 0] }, { data: [1, 0] }, { data: [0, 1] },, ])
    expect(q.add([0, 1]).root()).toEqual([{ data: [0, 0] }, { data: [1, 0] }, { data: [0, 1], next: { data: [0, 1] } },, ])
  })

  it('quadtree.add(datum) implicitly defines trivial bounds for the first point', () => {
    const q = quadtree().add([1, 2])
    expect(q.extent()).toEqual([[1, 2], [2, 3]])
    expect(q.root()).toEqual({ data: [1, 2] })
  })
})
