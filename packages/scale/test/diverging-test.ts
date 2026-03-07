import { expect, it } from 'bun:test'
import { scaleDiverging, scaleDivergingLog } from '../src/index.ts'

it('scaleDiverging() has the expected defaults', () => {
  const s = scaleDiverging()
  expect(s.domain()).toEqual([0, 0.5, 1])
  expect(s.interpolator()(0.42)).toBe(0.42)
  expect(s.clamp()).toBe(false)
  expect(s(-0.5)).toBe(-0.5)
  expect(s( 0.0)).toBe(0.0)
  expect(s( 0.5)).toBe(0.5)
  expect(s( 1.0)).toBe(1.0)
  expect(s( 1.5)).toBe(1.5)
})

it('diverging.clamp(true) enables clamping', () => {
  const s = scaleDiverging().clamp(true)
  expect(s.clamp()).toBe(true)
  expect(s(-0.5)).toBe(0.0)
  expect(s( 0.0)).toBe(0.0)
  expect(s( 0.5)).toBe(0.5)
  expect(s( 1.0)).toBe(1.0)
  expect(s( 1.5)).toBe(1.0)
})

it('diverging.domain() coerces domain values to numbers', () => {
  const s = scaleDiverging().domain(['-1.20', ' 0', '2.40'])
  expect(s.domain()).toEqual([-1.2, 0, 2.4])
  expect(s(-1.2)).toBe(0.000)
  expect(s( 0.6)).toBe(0.625)
  expect(s( 2.4)).toBe(1.000)
})

it('diverging.domain() accepts an iterable', () => {
  const s = scaleDiverging().domain(new Set([-1.2, 0, 2.4]))
  expect(s.domain()).toEqual([-1.2, 0, 2.4])
})

it('diverging.domain() handles a degenerate domain', () => {
  const s = scaleDiverging().domain([2, 2, 3])
  expect(s.domain()).toEqual([2, 2, 3])
  expect(s(-1.2)).toBe(0.5)
  expect(s( 0.6)).toBe(0.5)
  expect(s( 2.4)).toBe(0.7)
  expect(s.domain([1, 2, 2]).domain()).toEqual([1, 2, 2])
  expect(s(-1.0)).toBe(-1)
  expect(s( 0.5)).toBe(-0.25)
  expect(s( 2.4)).toBe(0.5)
  expect(s.domain([2, 2, 2]).domain()).toEqual([2, 2, 2])
  expect(s(-1.0)).toBe(0.5)
  expect(s( 0.5)).toBe(0.5)
  expect(s( 2.4)).toBe(0.5)
})

it('diverging.domain() handles a descending domain', () => {
  const s = scaleDiverging().domain([4, 2, 1])
  expect(s.domain()).toEqual([4, 2, 1])
  expect(s(1.2)).toBe(0.9)
  expect(s(2.0)).toBe(0.5)
  expect(s(3.0)).toBe(0.25)
})

it('divergingLog.domain() handles a descending domain', () => {
  const s = scaleDivergingLog().domain([3, 2, 1])
  expect(s.domain()).toEqual([3, 2, 1])
  expect(s(1.2)).toBe(1 - 0.1315172029168969)
  expect(s(2.0)).toBe(1 - 0.5000000000000000)
  expect(s(2.8)).toBe(1 - 0.9149213210862197)
})

it('divergingLog.domain() handles a descending negative domain', () => {
  const s = scaleDivergingLog().domain([-1, -2, -3])
  expect(s.domain()).toEqual([-1, -2, -3])
  expect(s(-1.2)).toBe(0.1315172029168969)
  expect(s(-2.0)).toBe(0.5000000000000000)
  expect(s(-2.8)).toBe(0.9149213210862197)
})

it('diverging.domain() handles a non-numeric domain', () => {
  const s = scaleDiverging().domain([NaN, 2, 3])
  expect(isNaN(s.domain()[0])).toBe(true)
  expect(isNaN(s(-1.2))).toBe(true)
  expect(isNaN(s( 0.6))).toBe(true)
  expect(s( 2.4)).toBe(0.7)
  expect(isNaN(s.domain([1, NaN, 2]).domain()[1])).toBe(true)
  expect(isNaN(s(-1.0))).toBe(true)
  expect(isNaN(s( 0.5))).toBe(true)
  expect(isNaN(s( 2.4))).toBe(true)
  expect(isNaN(s.domain([0, 1, NaN]).domain()[2])).toBe(true)
  expect(s(-1.0)).toBe(-0.5)
  expect(s( 0.5)).toBe(0.25)
  expect(isNaN(s( 2.4))).toBe(true)
})

it('diverging.domain() only considers the first three elements of the domain', () => {
  const s = scaleDiverging().domain([-1, 100, 200, 3])
  expect(s.domain()).toEqual([-1, 100, 200])
})

it('diverging.copy() returns an isolated copy of the scale', () => {
  const s1 = scaleDiverging().domain([1, 2, 3]).clamp(true)
  const s2 = s1.copy()
  expect(s2.domain()).toEqual([1, 2, 3])
  expect(s2.clamp()).toBe(true)
  s1.domain([-1, 1, 2])
  expect(s2.domain()).toEqual([1, 2, 3])
  s1.clamp(false)
  expect(s2.clamp()).toBe(true)
  s2.domain([3, 4, 5])
  expect(s1.domain()).toEqual([-1, 1, 2])
  s2.clamp(true)
  expect(s1.clamp()).toBe(false)
})

it('diverging.range() returns the computed range', () => {
  const s = scaleDiverging(function(t: any) { return t * 2 + 1 })
  expect(s.range()).toEqual([1, 2, 3])
})

it('diverging.interpolator(interpolator) sets the interpolator', () => {
  const i0 = function(t: any) { return t }
  const i1 = function(t: any) { return t * 2 }
  const s = scaleDiverging(i0)
  expect(s.interpolator()).toBe(i0)
  expect(s.interpolator(i1)).toBe(s)
  expect(s.interpolator()).toBe(i1)
  expect(s(-0.5)).toBe(-1.0)
  expect(s( 0.0)).toBe(0.0)
  expect(s( 0.5)).toBe(1.0)
})

it('diverging.range(range) sets the interpolator', () => {
  const s = scaleDiverging().range([1, 3, 10])
  expect(s.interpolator()(0.5)).toBe(3)
  expect(s.range()).toEqual([1, 3, 10])
})

it('diverging.range(range) ignores additional values', () => {
  const s = scaleDiverging().range([1, 3, 10, 20])
  expect(s.interpolator()(0.5)).toBe(3)
  expect(s.range()).toEqual([1, 3, 10])
})

it('scaleDiverging(range) sets the interpolator', () => {
  const s = scaleDiverging([1, 3, 10])
  expect(s.interpolator()(0.5)).toBe(3)
  expect(s.range()).toEqual([1, 3, 10])
})
