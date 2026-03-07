import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

function x(d: Record<string, number>): number {
  return d.x
}

describe('quadtree.x', () => {
  it('quadtree.x(x) sets the x-accessor used by quadtree.add', () => {
    const q = quadtree<Record<string, number>>().x(x).add({ x: 1, 1: 2 })
    expect(q.extent()).toEqual([[1, 2], [2, 3]])
    expect(q.root()).toEqual({ data: { x: 1, 1: 2 } })
  })

  it('quadtree.x(x) sets the x-accessor used by quadtree.addAll', () => {
    const q = quadtree<Record<string, number>>().x(x).addAll([{ x: 1, 1: 2 }])
    expect(q.extent()).toEqual([[1, 2], [2, 3]])
    expect(q.root()).toEqual({ data: { x: 1, 1: 2 } })
  })

  it('quadtree.x(x) sets the x-accessor used by quadtree.remove', () => {
    const p0 = { x: 0, 1: 1 }
    const p1 = { x: 1, 1: 2 }
    const q = quadtree<Record<string, number>>().x(x)
    expect(q.add(p0).root()).toEqual({ data: { x: 0, 1: 1 } })
    expect(q.add(p1).root()).toEqual([{ data: { x: 0, 1: 1 } },,, { data: { x: 1, 1: 2 } }])
    expect(q.remove(p1).root()).toEqual({ data: { x: 0, 1: 1 } })
    expect(q.remove(p0).root()).toBe(undefined)
  })
})
