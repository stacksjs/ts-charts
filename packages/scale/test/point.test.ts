import { expect, it } from 'bun:test'
import { scaleBand, scalePoint } from '../src/index.ts'

it('scalePoint() has the expected defaults', () => {
  const s = scalePoint()
  expect(s.domain()).toEqual([])
  expect(s.range()).toEqual([0, 1])
  expect(s.bandwidth()).toBe(0)
  expect(s.step()).toBe(1)
  expect(s.round()).toBe(false)
  expect(s.padding()).toBe(0)
  expect(s.align()).toBe(0.5)
})

it('scalePoint() does not expose paddingInner and paddingOuter', () => {
  const s = scalePoint()
  expect(s.paddingInner).toBe(undefined)
  expect(s.paddingOuter).toBe(undefined)
})

it('scalePoint() is similar to scaleBand().paddingInner(1)', () => {
  const p = scalePoint().domain(['foo', 'bar']).range([0, 960])
  const b = scaleBand().domain(['foo', 'bar']).range([0, 960]).paddingInner(1)
  expect(p.domain().map(p)).toEqual(b.domain().map(b))
  expect(p.bandwidth()).toBe(b.bandwidth())
  expect(p.step()).toBe(b.step())
})

it('point.padding(p) sets the band outer padding to p', () => {
  const p = scalePoint().domain(['foo', 'bar']).range([0, 960]).padding(0.5)
  const b = scaleBand().domain(['foo', 'bar']).range([0, 960]).paddingInner(1).paddingOuter(0.5)
  expect(p.domain().map(p)).toEqual(b.domain().map(b))
  expect(p.bandwidth()).toBe(b.bandwidth())
  expect(p.step()).toBe(b.step())
})

it('point.copy() returns a copy', () => {
  const s = scalePoint()
  expect(s.domain()).toEqual([])
  expect(s.range()).toEqual([0, 1])
  expect(s.bandwidth()).toBe(0)
  expect(s.step()).toBe(1)
  expect(s.round()).toBe(false)
  expect(s.padding()).toBe(0)
  expect(s.align()).toBe(0.5)
})
