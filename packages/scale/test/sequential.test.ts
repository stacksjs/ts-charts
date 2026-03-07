import { expect, it } from 'bun:test'
import { scaleSequential } from '../src/index.ts'

it('scaleSequential() has the expected defaults', () => {
  const s = scaleSequential()
  expect(s.domain()).toEqual([0, 1])
  expect(s.interpolator()(0.42)).toBe(0.42)
  expect(s.clamp()).toBe(false)
  expect(s.unknown()).toBe(undefined)
  expect(s(-0.5)).toBe(-0.5)
  expect(s( 0.0)).toBe(0.0)
  expect(s( 0.5)).toBe(0.5)
  expect(s( 1.0)).toBe(1.0)
  expect(s( 1.5)).toBe(1.5)
})

it('sequential.clamp(true) enables clamping', () => {
  const s = scaleSequential().clamp(true)
  expect(s.clamp()).toBe(true)
  expect(s(-0.5)).toBe(0.0)
  expect(s( 0.0)).toBe(0.0)
  expect(s( 0.5)).toBe(0.5)
  expect(s( 1.0)).toBe(1.0)
  expect(s( 1.5)).toBe(1.0)
})

it('sequential.unknown(value) sets the return value for undefined and NaN input', () => {
  const s = scaleSequential().unknown(-1)
  expect(s.unknown()).toBe(-1)
  expect(s(undefined)).toBe(-1)
  expect(s(NaN)).toBe(-1)
  expect(s('N/A')).toBe(-1)
  expect(s(0.4)).toBe(0.4)
})

it('sequential.domain() coerces domain values to numbers', () => {
  const s = scaleSequential().domain(['-1.20', '2.40'])
  expect(s.domain()).toEqual([-1.2, 2.4])
  expect(s(-1.2)).toBe(0.0)
  expect(s( 0.6)).toBe(0.5)
  expect(s( 2.4)).toBe(1.0)
})

it('sequential.domain() accepts an iterable', () => {
  const s = scaleSequential().domain(new Set(['-1.20', '2.40']))
  expect(s.domain()).toEqual([-1.2, 2.4])
})

it('sequential.domain() handles a degenerate domain', () => {
  const s = scaleSequential().domain([2, 2])
  expect(s.domain()).toEqual([2, 2])
  expect(s(-1.2)).toBe(0.5)
  expect(s( 0.6)).toBe(0.5)
  expect(s( 2.4)).toBe(0.5)
})

it('sequential.domain() handles a non-numeric domain', () => {
  const s = scaleSequential().domain([NaN, 2])
  expect(isNaN(s.domain()[0])).toBe(true)
  expect(s.domain()[1]).toBe(2)
  expect(isNaN(s(-1.2))).toBe(true)
  expect(isNaN(s( 0.6))).toBe(true)
  expect(isNaN(s( 2.4))).toBe(true)
})

it('sequential.domain() only considers the first and second element of the domain', () => {
  const s = scaleSequential().domain([-1, 100, 200])
  expect(s.domain()).toEqual([-1, 100])
})

it('sequential.copy() returns an isolated copy of the scale', () => {
  const s1 = scaleSequential().domain([1, 3]).clamp(true)
  const s2 = s1.copy()
  expect(s2.domain()).toEqual([1, 3])
  expect(s2.clamp()).toBe(true)
  s1.domain([-1, 2])
  expect(s2.domain()).toEqual([1, 3])
  s1.clamp(false)
  expect(s2.clamp()).toBe(true)
  s2.domain([3, 4])
  expect(s1.domain()).toEqual([-1, 2])
  s2.clamp(true)
  expect(s1.clamp()).toBe(false)
})

it('sequential.interpolator(interpolator) sets the interpolator', () => {
  const i0 = function(t: any) { return t }
  const i1 = function(t: any) { return t * 2 }
  const s = scaleSequential(i0)
  expect(s.interpolator()).toBe(i0)
  expect(s.interpolator(i1)).toBe(s)
  expect(s.interpolator()).toBe(i1)
  expect(s(-0.5)).toBe(-1.0)
  expect(s( 0.0)).toBe(0.0)
  expect(s( 0.5)).toBe(1.0)
})

it('sequential.range() returns the computed range', () => {
  const s = scaleSequential(function(t: any) { return t * 2 + 1 })
  expect(s.range()).toEqual([1, 3])
})

it('sequential.range(range) sets the interpolator', () => {
  const s = scaleSequential().range([1, 3])
  expect(s.interpolator()(0.5)).toBe(2)
  expect(s.range()).toEqual([1, 3])
})

it('sequential.range(range) ignores additional values', () => {
  const s = scaleSequential().range([1, 3, 10])
  expect(s.interpolator()(0.5)).toBe(2)
  expect(s.range()).toEqual([1, 3])
})

it('scaleSequential(range) sets the interpolator', () => {
  const s = scaleSequential([1, 3])
  expect(s.interpolator()(0.5)).toBe(2)
  expect(s.range()).toEqual([1, 3])
})
