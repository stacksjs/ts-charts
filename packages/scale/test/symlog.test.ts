import { expect, it } from 'bun:test'
import { scaleSymlog } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number = 1e-6) {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

it('scaleSymlog() has the expected defaults', () => {
  const s = scaleSymlog()
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([0, 1])
  expect(s.clamp()).toBe(false)
  expect(s.constant!()).toBe(1)
})

it('symlog(x) maps a domain value x to a range value y', () => {
  const s = scaleSymlog().domain([-100, 100])
  expect(s(-100)).toBe(0)
  expect(s(100)).toBe(1)
  expect(s(0)).toBe(0.5)
})

it('symlog.invert(y) maps a range value y to a domain value x', () => {
  const s = scaleSymlog().domain([-100, 100])
  assertInDelta(s.invert(1), 100)
})

it('symlog.invert(y) coerces range values to numbers', () => {
  const s = scaleSymlog().range(['-3', '3'])
  expect(s.invert(3)).toEqual(1)
})

it('symlog.invert(y) returns NaN if the range is not coercible to number', () => {
  expect(isNaN(scaleSymlog().range(['#000', '#fff']).invert('#999'))).toBe(true)
  expect(isNaN(scaleSymlog().range([0, '#fff']).invert('#999'))).toBe(true)
})

it('symlog.constant(constant) sets the constant to the specified value', () => {
  const s = scaleSymlog().constant!(5)
  expect(s.constant!()).toBe(5)
})

it('symlog.constant(constant) changing the constant does not change the domain or range', () => {
  const s = scaleSymlog().constant!(2)
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([0, 1])
})

it('symlog.domain(domain) accepts an array of numbers', () => {
  expect(scaleSymlog().domain([]).domain()).toEqual([])
  expect(scaleSymlog().domain([1, 0]).domain()).toEqual([1, 0])
  expect(scaleSymlog().domain([1, 2, 3]).domain()).toEqual([1, 2, 3])
})

it('symlog.domain(domain) coerces domain values to numbers', () => {
  expect(scaleSymlog().domain([new Date(Date.UTC(1990, 0, 1)), new Date(Date.UTC(1991, 0, 1))]).domain()).toEqual([631152000000, 662688000000])
  expect(scaleSymlog().domain(['0.0', '1.0']).domain()).toEqual([0, 1])
  expect(scaleSymlog().domain([new Number(0), new Number(1)]).domain()).toEqual([0, 1])
})

it('symlog.domain(domain) makes a copy of domain values', () => {
  const d = [1, 2], s = scaleSymlog().domain(d)
  expect(s.domain()).toEqual([1, 2])
  d.push(3)
  expect(s.domain()).toEqual([1, 2])
  expect(d).toEqual([1, 2, 3])
})

it('symlog.domain() returns a copy of domain values', () => {
  const s = scaleSymlog(), d = s.domain()
  expect(d).toEqual([0, 1])
  d.push(3)
  expect(s.domain()).toEqual([0, 1])
})

it('symlog.range(range) does not coerce range to numbers', () => {
  const s = scaleSymlog().range(['0px', '2px'])
  expect(s.range()).toEqual(['0px', '2px'])
  expect(s(1)).toBe('2px')
})

it('symlog.range(range) can accept range values as arrays or objects', () => {
  expect(scaleSymlog().range([{color: 'red'}, {color: 'blue'}])(1)).toEqual({color: 'rgb(0, 0, 255)'})
  expect(scaleSymlog().range([['red'], ['blue']])(0)).toEqual(['rgb(255, 0, 0)'])
})

it('symlog.range(range) makes a copy of range values', () => {
  const r = [1, 2], s = scaleSymlog().range(r)
  expect(s.range()).toEqual([1, 2])
  r.push(3)
  expect(s.range()).toEqual([1, 2])
  expect(r).toEqual([1, 2, 3])
})

it('symlog.range() returns a copy of range values', () => {
  const s = scaleSymlog(), r = s.range()
  expect(r).toEqual([0, 1])
  r.push(3)
  expect(s.range()).toEqual([0, 1])
})

it('symlog.clamp() is false by default', () => {
  expect(scaleSymlog().clamp()).toBe(false)
  expect(scaleSymlog().range([10, 20])(3)).toBe(30)
  expect(scaleSymlog().range([10, 20])(-1)).toBe(0)
  expect(scaleSymlog().range([10, 20]).invert(30)).toBe(3)
  expect(scaleSymlog().range([10, 20]).invert(0)).toBe(-1)
})

it('symlog.clamp(true) restricts output values to the range', () => {
  expect(scaleSymlog().clamp(true).range([10, 20])(2)).toBe(20)
  expect(scaleSymlog().clamp(true).range([10, 20])(-1)).toBe(10)
})

it('symlog.clamp(true) restricts input values to the domain', () => {
  expect(scaleSymlog().clamp(true).range([10, 20]).invert(30)).toBe(1)
  expect(scaleSymlog().clamp(true).range([10, 20]).invert(0)).toBe(0)
})

it('symlog.clamp(clamp) coerces the specified clamp value to a boolean', () => {
  expect(scaleSymlog().clamp('true').clamp()).toBe(true)
  expect(scaleSymlog().clamp(1).clamp()).toBe(true)
  expect(scaleSymlog().clamp('').clamp()).toBe(false)
  expect(scaleSymlog().clamp(0).clamp()).toBe(false)
})

it('symlog.copy() returns a copy with changes to the domain are isolated', () => {
  const x = scaleSymlog(), y = x.copy()
  x.domain([1, 2])
  expect(y.domain()).toEqual([0, 1])
  expect(x(1)).toBe(0)
  expect(y(1)).toBe(1)
  y.domain([2, 3])
  expect(x(2)).toBe(1)
  expect(y(2)).toBe(0)
  expect(x.domain()).toEqual([1, 2])
  expect(y.domain()).toEqual([2, 3])
  const y2 = x.domain([1, 1.9]).copy()
  x.nice!(5)
  expect(x.domain()).toEqual([1, 2])
  expect(y2.domain()).toEqual([1, 1.9])
})

it('symlog.copy() returns a copy with changes to the range are isolated', () => {
  const x = scaleSymlog(), y = x.copy()
  x.range([1, 2])
  expect(x.invert(1)).toBe(0)
  expect(y.invert(1)).toBe(1)
  expect(y.range()).toEqual([0, 1])
  y.range([2, 3])
  expect(x.invert(2)).toBe(1)
  expect(y.invert(2)).toBe(0)
  expect(x.range()).toEqual([1, 2])
  expect(y.range()).toEqual([2, 3])
})

it('symlog.copy() returns a copy with changes to clamping are isolated', () => {
  const x = scaleSymlog().clamp(true), y = x.copy()
  x.clamp(false)
  expect(x(3)).toBe(2)
  expect(y(2)).toBe(1)
  expect(y.clamp()).toBe(true)
  y.clamp(false)
  expect(x(3)).toBe(2)
  expect(y(3)).toBe(2)
  expect(x.clamp()).toBe(false)
})

it('symlog().clamp(true).invert(x) cannot return a value outside the domain', () => {
  const x = scaleSymlog().domain([1, 20]).clamp(true)
  expect(x.invert(0)).toBe(1)
  expect(x.invert(1)).toBe(20)
})
