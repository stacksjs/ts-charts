import { expect, it } from 'bun:test'
import { scaleRadial } from '../src/index.ts'

it('scaleRadial() has the expected defaults', () => {
  const s = scaleRadial()
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([0, 1])
  expect(s.clamp()).toBe(false)
  expect(s.round()).toBe(false)
})

it('scaleRadial(range) sets the range', () => {
  const s = scaleRadial([100, 200])
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([100, 200])
  expect(s(0.5)).toBe(158.11388300841898)
})

it('scaleRadial(domain, range) sets the range', () => {
  const s = scaleRadial([1, 2], [10, 20])
  expect(s.domain()).toEqual([1, 2])
  expect(s.range()).toEqual([10, 20])
  expect(s(1.5)).toBe(15.811388300841896)
})

it('radial(x) maps a domain value x to a range value y', () => {
  expect(scaleRadial([1, 2])(0.5)).toBe(1.5811388300841898)
})

it('radial(x) ignores extra range values if the domain is smaller than the range', () => {
  expect(scaleRadial().domain([-10, 0]).range([2, 3, 4]).clamp(true)(-5)).toBe(2.5495097567963922)
  expect(scaleRadial().domain([-10, 0]).range([2, 3, 4]).clamp(true)(50)).toBe(3)
})

it('radial(x) ignores extra domain values if the range is smaller than the domain', () => {
  expect(scaleRadial().domain([-10, 0, 100]).range([2, 3]).clamp(true)(-5)).toBe(2.5495097567963922)
  expect(scaleRadial().domain([-10, 0, 100]).range([2, 3]).clamp(true)(50)).toBe(3)
})

it('radial(x) maps an empty domain to the middle of the range', () => {
  expect(scaleRadial().domain([0, 0]).range([1, 2])(0)).toBe(1.5811388300841898)
  expect(scaleRadial().domain([0, 0]).range([2, 1])(1)).toBe(1.5811388300841898)
})

it('radial(x) can map a bilinear domain with two values to the corresponding range', () => {
  const s = scaleRadial().domain([1, 2])
  expect(s.domain()).toEqual([1, 2])
  expect(s(0.5)).toBe(-0.7071067811865476)
  expect(s(1.0)).toBe(0.0)
  expect(s(1.5)).toBe(0.7071067811865476)
  expect(s(2.0)).toBe(1.0)
  expect(s(2.5)).toBe(1.224744871391589)
  expect(s.invert(-0.5)).toBe(0.75)
  expect(s.invert( 0.0)).toBe(1.0)
  expect(s.invert( 0.5)).toBe(1.25)
  expect(s.invert( 1.0)).toBe(2.0)
  expect(s.invert( 1.5)).toBe(3.25)
})

it('radial(NaN) returns undefined', () => {
  const s = scaleRadial()
  expect(s(NaN)).toBe(undefined)
  expect(s(undefined)).toBe(undefined)
  expect(s('foo')).toBe(undefined)
  expect(s({})).toBe(undefined)
})

it('radial.unknown(unknown)(NaN) returns the specified unknown value', () => {
  expect(scaleRadial().unknown('foo')(NaN)).toBe('foo')
})

it('radial(x) can handle a negative range', () => {
  expect(scaleRadial([-1, -2])(0.5)).toBe(-1.5811388300841898)
})

it('radial(x) can clamp negative values', () => {
  expect(scaleRadial([-1, -2]).clamp(true)(-0.5)).toBe(-1)
  expect(scaleRadial().clamp(true)(-0.5)).toBe(0)
  expect(scaleRadial([-0.25, 0], [1, 2]).clamp(true)(-0.5)).toBe(1)
})
