import { describe, expect, it } from 'bun:test'
import { Quadtree, quadtree } from '../src/index.ts'

describe('quadtree', () => {
  it('quadtree() creates an empty quadtree', () => {
    const q = quadtree()
    expect(q instanceof Quadtree).toBe(true)
    expect(q.visit(() => { throw new Error() })).toBe(q)
    expect(q.size()).toBe(0)
    expect(q.extent()).toBe(undefined)
    expect(q.root()).toBe(undefined)
    expect(q.data()).toEqual([])
  })

  it('quadtree(nodes) is equivalent to quadtree().addAll(nodes)', () => {
    const q = quadtree([[0, 0], [1, 1]])
    expect(q instanceof Quadtree).toBe(true)
    expect(q.root()).toEqual([{ data: [0, 0] },,, { data: [1, 1] }])
  })

  it('quadtree(nodes, x, y) is equivalent to quadtree().x(x).y(y).addAll(nodes)', () => {
    const q = quadtree([{ x: 0, y: 0 }, { x: 1, y: 1 }], (d: { x: number, y: number }) => d.x, (d: { x: number, y: number }) => d.y)
    expect(q instanceof Quadtree).toBe(true)
    expect(q.root()).toEqual([{ data: { x: 0, y: 0 } },,, { data: { x: 1, y: 1 } }])
  })
})
