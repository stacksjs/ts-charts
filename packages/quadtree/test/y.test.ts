import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

function y(d: Record<string, number>): number {
  return d.y
}

describe('quadtree.y', () => {
  it('quadtree.y(y) sets the y-accessor used by quadtree.add', () => {
    const q = quadtree<Record<string, number>>().y(y).add({ 0: 1, y: 2 })
    expect(q.extent()).toEqual([[1, 2], [2, 3]])
    expect(q.root()).toEqual({ data: { 0: 1, y: 2 } })
  })

  it('quadtree.y(y) sets the y-accessor used by quadtree.addAll', () => {
    const q = quadtree<Record<string, number>>().y(y).addAll([{ 0: 1, y: 2 }])
    expect(q.extent()).toEqual([[1, 2], [2, 3]])
    expect(q.root()).toEqual({ data: { 0: 1, y: 2 } })
  })

  it('quadtree.y(y) sets the y-accessor used by quadtree.remove', () => {
    const p0 = { 0: 0, y: 1 }
    const p1 = { 0: 1, y: 2 }
    const q = quadtree<Record<string, number>>().y(y)
    expect(q.add(p0).root()).toEqual({ data: { 0: 0, y: 1 } })
    expect(q.add(p1).root()).toEqual([{ data: { 0: 0, y: 1 } },,, { data: { 0: 1, y: 2 } }])
    expect(q.remove(p1).root()).toEqual({ data: { 0: 0, y: 1 } })
    expect(q.remove(p0).root()).toBe(undefined)
  })
})
