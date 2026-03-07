import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

describe('quadtree.copy', () => {
  it('quadtree.copy() returns a copy of this quadtree', () => {
    const q0 = quadtree().addAll([[0, 0], [1, 0], [0, 1], [1, 1]])
    expect(q0.copy()).toEqual(q0)
  })

  it('quadtree.copy() isolates changes to the extent', () => {
    const q0 = quadtree().extent([[0, 0], [1, 1]])
    const q1 = q0.copy()
    q0.add([2, 2])
    expect(q1.extent()).toEqual([[0, 0], [2, 2]])
    q1.add([-1, -1])
    expect(q0.extent()).toEqual([[0, 0], [4, 4]])
  })

  it('quadtree.copy() isolates changes to the root when a leaf', () => {
    const q0 = quadtree().extent([[0, 0], [1, 1]])
    const q1 = q0.copy()
    const p0: [number, number] = [2, 2]
    q0.add(p0)
    expect(q1.root()).toBe(undefined)
    const q2 = q0.copy()
    expect(q0.root()).toEqual({ data: [2, 2] })
    expect(q2.root()).toEqual({ data: [2, 2] })
    expect(q0.remove(p0)).toBe(q0)
    expect(q0.root()).toBe(undefined)
    expect(q2.root()).toEqual({ data: [2, 2] })
  })

  it('quadtree.copy() isolates changes to the root when not a leaf', () => {
    const p0: [number, number] = [1, 1]
    const p1: [number, number] = [2, 2]
    const p2: [number, number] = [3, 3]
    const q0 = quadtree().extent([[0, 0], [4, 4]]).addAll([p0, p1])
    const q1 = q0.copy()
    q0.add(p2)
    expect(q0.extent()).toEqual([[0, 0], [8, 8]])
    expect(q0.root()).toEqual([[{ data: [1, 1] },,, [{ data: [2, 2] },,, { data: [3, 3] }]],,,, ])
    expect(q1.extent()).toEqual([[0, 0], [8, 8]])
    expect(q1.root()).toEqual([[{ data: [1, 1] },,, { data: [2, 2] }],,,, ])
    const q3 = q0.copy()
    q0.remove(p2)
    expect(q3.extent()).toEqual([[0, 0], [8, 8]])
    expect(q3.root()).toEqual([[{ data: [1, 1] },,, [{ data: [2, 2] },,, { data: [3, 3] }]],,,, ])
  })
})
