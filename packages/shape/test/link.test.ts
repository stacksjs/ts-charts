import { describe, it, expect } from 'bun:test'
import { pathRound } from '@ts-charts/path'
import { link, linkHorizontal, linkVertical, linkRadial } from '../src/index.ts'
import { curveLinear, curveBumpX, curveBumpY } from '../src/index.ts'
import { assertPathEqual } from './asserts.ts'

it('link(curve) returns a default link with the given curve', () => {
  const l = link(curveLinear)
  expect(l.source()({ source: 42 })).toBe(42)
  expect(l.target()({ target: 34 })).toBe(34)
  expect(l.x()([42, 34])).toBe(42)
  expect(l.y()([42, 34])).toBe(34)
  expect(l.context()).toBeNull()
  assertPathEqual(l({ source: [0, 1], target: [2, 3] }), 'M0,1L2,3')
})

it('link.source(source) sets source', () => {
  const l = link(curveLinear)
  const x = (d: any) => d.x
  expect(l.source(x)).toBe(l)
  expect(l.source()).toBe(x)
  assertPathEqual(l({ x: [0, 1], target: [2, 3] }), 'M0,1L2,3')
})

it('link.target(target) sets target', () => {
  const l = link(curveLinear)
  const x = (d: any) => d.x
  expect(l.target(x)).toBe(l)
  expect(l.target()).toBe(x)
  assertPathEqual(l({ source: [0, 1], x: [2, 3] }), 'M0,1L2,3')
})

it('link.x(x) sets x', () => {
  const l = link(curveLinear)
  const x = (d: any) => d.x
  expect(l.x(x)).toBe(l)
  expect(l.x()).toBe(x)
  assertPathEqual(l({ source: { x: 0, 1: 1 }, target: { x: 2, 1: 3 } }), 'M0,1L2,3')
})

it('link.y(y) sets y', () => {
  const l = link(curveLinear)
  const y = (d: any) => d.y
  expect(l.y(y)).toBe(l)
  expect(l.y()).toBe(y)
  assertPathEqual(l({ source: { 0: 0, y: 1 }, target: { 0: 2, y: 3 } }), 'M0,1L2,3')
})

it('linkHorizontal() is an alias for link(curveBumpX)', () => {
  const l = linkHorizontal(), l2 = link(curveBumpX)
  expect(l.source()).toEqual(l2.source())
  expect(l.target()).toEqual(l2.target())
  expect(l.x()).toEqual(l2.x())
  expect(l.y()).toEqual(l2.y())
  expect(l.context()).toBe(l2.context())
  assertPathEqual(l({ source: [0, 1], target: [2, 3] }), l2({ source: [0, 1], target: [2, 3] }))
})

it('linkVertical() is an alias for link(curveBumpY)', () => {
  const l = linkVertical(), l2 = link(curveBumpY)
  expect(l.source()).toEqual(l2.source())
  expect(l.target()).toEqual(l2.target())
  expect(l.x()).toEqual(l2.x())
  expect(l.y()).toEqual(l2.y())
  expect(l.context()).toBe(l2.context())
  assertPathEqual(l({ source: [0, 1], target: [2, 3] }), l2({ source: [0, 1], target: [2, 3] }))
})

it('link.context(context) sets the context', () => {
  const p = pathRound(6)
  const l = link(curveLinear).context(p)
  expect(l({ source: [0, Math.E], target: [Math.PI, 3] })).toBeUndefined()
  expect(p + '').toBe('M0,2.718282L3.141593,3')
})

it('linkRadial() works as expected', () => {
  const l = linkRadial(), l2 = link()
  expect(l.source()).toEqual(l2.source())
  expect(l.target()).toEqual(l2.target())
  expect(l.angle()).toEqual(l2.x())
  expect(l.radius()).toEqual(l2.y())
  expect(l.context()).toBe(l2.context())
  assertPathEqual(l({ source: [0, 1], target: [Math.PI / 2, 3] }), 'M0,-1C0,-2,2,0,3,0')
})
