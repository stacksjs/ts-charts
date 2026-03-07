import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'
import type { QuadtreeLeaf } from '../src/index.ts'

describe('quadtree.remove', () => {
  it('quadtree.remove(datum) removes a point and returns the quadtree', () => {
    const p0: [number, number] = [1, 1]
    const q = quadtree().add(p0)
    expect(q.root()).toEqual({ data: p0 })
    expect(q.remove(p0)).toBe(q)
    expect(q.root()).toEqual(undefined)
  })

  it('quadtree.remove(datum) removes the only point in the quadtree', () => {
    const p0: [number, number] = [1, 1]
    const q = quadtree().add(p0)
    expect(q.remove(p0)).toBe(q)
    expect(q.extent()).toEqual([[1, 1], [2, 2]])
    expect(q.root()).toEqual(undefined)
    expect(p0).toEqual([1, 1])
  })

  it('quadtree.remove(datum) removes a first coincident point at the root in the quadtree', () => {
    const p0: [number, number] = [1, 1]
    const p1: [number, number] = [1, 1]
    const q = quadtree().addAll([p0, p1])
    expect(q.remove(p0)).toBe(q)
    expect(q.extent()).toEqual([[1, 1], [2, 2]])
    expect((q.root() as QuadtreeLeaf<[number, number]>).data).toBe(p1)
    expect(p0).toEqual([1, 1])
    expect(p1).toEqual([1, 1])
  })

  it('quadtree.remove(datum) removes another coincident point at the root in the quadtree', () => {
    const p0: [number, number] = [1, 1]
    const p1: [number, number] = [1, 1]
    const q = quadtree().addAll([p0, p1])
    expect(q.remove(p1)).toBe(q)
    expect(q.extent()).toEqual([[1, 1], [2, 2]])
    expect((q.root() as QuadtreeLeaf<[number, number]>).data).toBe(p0)
    expect(p0).toEqual([1, 1])
    expect(p1).toEqual([1, 1])
  })

  it('quadtree.remove(datum) removes a non-root point in the quadtree', () => {
    const p0: [number, number] = [0, 0]
    const p1: [number, number] = [1, 1]
    const q = quadtree().addAll([p0, p1])
    expect(q.remove(p0)).toBe(q)
    expect(q.extent()).toEqual([[0, 0], [2, 2]])
    expect((q.root() as QuadtreeLeaf<[number, number]>).data).toBe(p1)
    expect(p0).toEqual([0, 0])
    expect(p1).toEqual([1, 1])
  })

  it('quadtree.remove(datum) removes another non-root point in the quadtree', () => {
    const p0: [number, number] = [0, 0]
    const p1: [number, number] = [1, 1]
    const q = quadtree().addAll([p0, p1])
    expect(q.remove(p1)).toBe(q)
    expect(q.extent()).toEqual([[0, 0], [2, 2]])
    expect((q.root() as QuadtreeLeaf<[number, number]>).data).toBe(p0)
    expect(p0).toEqual([0, 0])
    expect(p1).toEqual([1, 1])
  })

  it('quadtree.remove(datum) ignores a point not in the quadtree', () => {
    const p0: [number, number] = [0, 0]
    const p1: [number, number] = [1, 1]
    const q0 = quadtree().add(p0)
    const q1 = quadtree().add(p1)
    expect(q0.remove(p1)).toBe(q0)
    expect(q0.extent()).toEqual([[0, 0], [1, 1]])
    expect((q0.root() as QuadtreeLeaf<[number, number]>).data).toBe(p0)
    expect((q1.root() as QuadtreeLeaf<[number, number]>).data).toBe(p1)
  })

  it('quadtree.remove(datum) ignores a coincident point not in the quadtree', () => {
    const p0: [number, number] = [0, 0]
    const p1: [number, number] = [0, 0]
    const q0 = quadtree().add(p0)
    const q1 = quadtree().add(p1)
    expect(q0.remove(p1)).toBe(q0)
    expect(q0.extent()).toEqual([[0, 0], [1, 1]])
    expect((q0.root() as QuadtreeLeaf<[number, number]>).data).toBe(p0)
    expect((q1.root() as QuadtreeLeaf<[number, number]>).data).toBe(p1)
  })

  it('quadtree.remove(datum) removes another point in the quadtree', () => {
    const q = quadtree().extent([[0, 0], [959, 959]])
    q.addAll([[630, 438], [715, 464], [523, 519], [646, 318], [434, 620], [570, 489], [520, 345], [459, 443], [346, 405], [529, 444]])
    expect(q.remove(q.find(546, 440)!)).toBe(q)
    expect(q.extent()).toEqual([[0, 0], [1024, 1024]])
    expect(q.root()).toEqual([
      [
        ,
        ,
        ,
        [
          ,
          ,
          { data: [346, 405] },
          { data: [459, 443] },
        ],
      ],
      [
        ,
        ,
        [
          { data: [520, 345] },
          { data: [646, 318] },
          [
            ,
            { data: [630, 438] },
            { data: [570, 489] },,
          ],
          { data: [715, 464] },
        ],,
      ],
      { data: [434, 620] },
      { data: [523, 519] },
    ])
  })
})
