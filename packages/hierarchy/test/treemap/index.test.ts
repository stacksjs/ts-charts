import { describe, expect, it } from 'bun:test'
import { hierarchy, treemap, treemapSlice, treemapSquarify } from '../../src/index.ts'
import { round } from './round.ts'

import simple from '../data/simple2.json'
import simple3 from '../data/simple3.json'

function defaultValue(d: any): number {
  return d.value
}

function ascendingValue(a: any, b: any): number {
  return a.value - b.value
}

function descendingValue(a: any, b: any): number {
  return b.value - a.value
}

describe('treemap', () => {
  it('treemap() has the expected defaults', () => {
    const t = treemap()
    expect(t.tile()).toBe(treemapSquarify)
    expect(t.size()).toEqual([1, 1])
    expect(t.round()).toBe(false)
  })

  it('treemap.round(round) observes the specified rounding', () => {
    const t = treemap().size([600, 400]).round(true)
    const root = t(hierarchy(simple as any).sum(defaultValue).sort(descendingValue))
    const nodes = root.descendants().map(round)
    expect(t.round()).toBe(true)
    expect(nodes).toEqual([
      { x0: 0, x1: 600, y0: 0, y1: 400 },
      { x0: 0, x1: 300, y0: 0, y1: 200 },
      { x0: 0, x1: 300, y0: 200, y1: 400 },
      { x0: 300, x1: 471, y0: 0, y1: 233 },
      { x0: 471, x1: 600, y0: 0, y1: 233 },
      { x0: 300, x1: 540, y0: 233, y1: 317 },
      { x0: 300, x1: 540, y0: 317, y1: 400 },
      { x0: 540, x1: 600, y0: 233, y1: 400 },
    ])
  })

  it('treemap.round(round) coerces the specified round to boolean', () => {
    const t = treemap().round('yes' as any)
    expect(t.round()).toBe(true)
  })

  it('treemap.padding(padding) sets the inner and outer padding to the specified value', () => {
    const t = treemap().padding('42' as any)
    expect(t.padding()({} as any)).toBe(42)
    expect(t.paddingInner()({} as any)).toBe(42)
    expect(t.paddingOuter()({} as any)).toBe(42)
    expect(t.paddingTop()({} as any)).toBe(42)
    expect(t.paddingRight()({} as any)).toBe(42)
    expect(t.paddingBottom()({} as any)).toBe(42)
    expect(t.paddingLeft()({} as any)).toBe(42)
  })

  it('treemap.paddingInner(padding) observes the specified padding', () => {
    const t = treemap().size([6, 4]).paddingInner(0.5)
    const root = t(hierarchy(simple as any).sum(defaultValue).sort(descendingValue))
    const nodes = root.descendants().map(round)
    expect(t.paddingInner()({} as any)).toBe(0.5)
    expect(t.size()).toEqual([6, 4])
    expect(nodes).toEqual([
      { x0: 0.00, x1: 6.00, y0: 0.00, y1: 4.00 },
      { x0: 0.00, x1: 2.75, y0: 0.00, y1: 1.75 },
      { x0: 0.00, x1: 2.75, y0: 2.25, y1: 4.00 },
      { x0: 3.25, x1: 4.61, y0: 0.00, y1: 2.13 },
      { x0: 5.11, x1: 6.00, y0: 0.00, y1: 2.13 },
      { x0: 3.25, x1: 5.35, y0: 2.63, y1: 3.06 },
      { x0: 3.25, x1: 5.35, y0: 3.56, y1: 4.00 },
      { x0: 5.85, x1: 6.00, y0: 2.63, y1: 4.00 },
    ])
  })

  it('treemap.paddingOuter(padding) observes the specified padding', () => {
    const t = treemap().size([6, 4]).paddingOuter(0.5)
    const root = t(hierarchy(simple as any).sum(defaultValue).sort(descendingValue))
    const nodes = root.descendants().map(round)
    expect(t.paddingOuter()({} as any)).toBe(0.5)
    expect(t.paddingTop()({} as any)).toBe(0.5)
    expect(t.paddingRight()({} as any)).toBe(0.5)
    expect(t.paddingBottom()({} as any)).toBe(0.5)
    expect(t.paddingLeft()({} as any)).toBe(0.5)
    expect(t.size()).toEqual([6, 4])
    expect(nodes).toEqual([
      { x0: 0.00, x1: 6.00, y0: 0.00, y1: 4.00 },
      { x0: 0.50, x1: 3.00, y0: 0.50, y1: 2.00 },
      { x0: 0.50, x1: 3.00, y0: 2.00, y1: 3.50 },
      { x0: 3.00, x1: 4.43, y0: 0.50, y1: 2.25 },
      { x0: 4.43, x1: 5.50, y0: 0.50, y1: 2.25 },
      { x0: 3.00, x1: 5.00, y0: 2.25, y1: 2.88 },
      { x0: 3.00, x1: 5.00, y0: 2.88, y1: 3.50 },
      { x0: 5.00, x1: 5.50, y0: 2.25, y1: 3.50 },
    ])
  })

  it('treemap.size(size) observes the specified size', () => {
    const t = treemap().size([6, 4])
    const root = t(hierarchy(simple as any).sum(defaultValue).sort(descendingValue))
    const nodes = root.descendants().map(round)
    expect(t.size()).toEqual([6, 4])
    expect(nodes).toEqual([
      { x0: 0.00, x1: 6.00, y0: 0.00, y1: 4.00 },
      { x0: 0.00, x1: 3.00, y0: 0.00, y1: 2.00 },
      { x0: 0.00, x1: 3.00, y0: 2.00, y1: 4.00 },
      { x0: 3.00, x1: 4.71, y0: 0.00, y1: 2.33 },
      { x0: 4.71, x1: 6.00, y0: 0.00, y1: 2.33 },
      { x0: 3.00, x1: 5.40, y0: 2.33, y1: 3.17 },
      { x0: 3.00, x1: 5.40, y0: 3.17, y1: 4.00 },
      { x0: 5.40, x1: 6.00, y0: 2.33, y1: 4.00 },
    ])
  })

  it('treemap.size(size) coerces the specified size to numbers', () => {
    const t = treemap().size(['6', { valueOf: function () { return 4 } }] as any)
    expect(t.size()[0]).toBe(6)
    expect(t.size()[1]).toBe(4)
  })

  it('treemap.tile(tile) observes the specified tile function', () => {
    const t = treemap().size([6, 4]).tile(treemapSlice as any)
    const root = t(hierarchy(simple as any).sum(defaultValue).sort(descendingValue))
    const nodes = root.descendants().map(round)
    expect(t.tile()).toBe(treemapSlice)
    expect(nodes).toEqual([
      { x0: 0.00, x1: 6.00, y0: 0.00, y1: 4.00 },
      { x0: 0.00, x1: 6.00, y0: 0.00, y1: 1.00 },
      { x0: 0.00, x1: 6.00, y0: 1.00, y1: 2.00 },
      { x0: 0.00, x1: 6.00, y0: 2.00, y1: 2.67 },
      { x0: 0.00, x1: 6.00, y0: 2.67, y1: 3.17 },
      { x0: 0.00, x1: 6.00, y0: 3.17, y1: 3.50 },
      { x0: 0.00, x1: 6.00, y0: 3.50, y1: 3.83 },
      { x0: 0.00, x1: 6.00, y0: 3.83, y1: 4.00 },
    ])
  })

  it('treemap(data) observes the specified values', () => {
    const foo = (d: any) => d.foo
    const t = treemap().size([6, 4])
    const root = t(hierarchy(simple3 as any).sum(foo).sort(descendingValue))
    const nodes = root.descendants().map(round)
    expect(t.size()).toEqual([6, 4])
    expect(nodes).toEqual([
      { x0: 0.00, x1: 6.00, y0: 0.00, y1: 4.00 },
      { x0: 0.00, x1: 3.00, y0: 0.00, y1: 2.00 },
      { x0: 0.00, x1: 3.00, y0: 2.00, y1: 4.00 },
      { x0: 3.00, x1: 4.71, y0: 0.00, y1: 2.33 },
      { x0: 4.71, x1: 6.00, y0: 0.00, y1: 2.33 },
      { x0: 3.00, x1: 5.40, y0: 2.33, y1: 3.17 },
      { x0: 3.00, x1: 5.40, y0: 3.17, y1: 4.00 },
      { x0: 5.40, x1: 6.00, y0: 2.33, y1: 4.00 },
    ])
  })

  it('treemap(data) observes the specified sibling order', () => {
    const t = treemap()
    const root = t(hierarchy(simple as any).sum(defaultValue).sort(ascendingValue))
    expect(root.descendants().map(d => d.value)).toEqual([24, 1, 2, 2, 3, 4, 6, 6])
  })
})
