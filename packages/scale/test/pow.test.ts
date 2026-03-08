import { expect, it } from 'bun:test'
import { scalePow, scaleSqrt } from '../src/index.ts'
import { roundEpsilon } from './roundEpsilon.ts'

function assertInDelta(actual: number, expected: number, delta: number = 1e-6) {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

it('scalePow() has the expected defaults', () => {
  const s = scalePow()
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([0, 1])
  expect(s.clamp()).toBe(false)
  expect(s.exponent!()).toBe(1)
  expect(s.interpolate()({array: ['red']}, {array: ['blue']})(0.5)).toEqual({array: ['rgb(128, 0, 128)']})
})

it('pow(x) maps a domain value x to a range value y', () => {
  expect(scalePow().exponent!(0.5)(0.5)).toBe(Math.SQRT1_2)
})

it('pow(x) ignores extra range values if the domain is smaller than the range', () => {
  expect(scalePow().domain([-10, 0]).range(['red', 'white', 'green']).clamp(true)(-5)).toBe('rgb(255, 128, 128)')
  expect(scalePow().domain([-10, 0]).range(['red', 'white', 'green']).clamp(true)(50)).toBe('rgb(255, 255, 255)')
})

it('pow(x) ignores extra domain values if the range is smaller than the domain', () => {
  expect(scalePow().domain([-10, 0, 100]).range(['red', 'white']).clamp(true)(-5)).toBe('rgb(255, 128, 128)')
  expect(scalePow().domain([-10, 0, 100]).range(['red', 'white']).clamp(true)(50)).toBe('rgb(255, 255, 255)')
})

it('pow(x) maps an empty domain to the middle of the range', () => {
  expect(scalePow().domain([0, 0]).range([1, 2])(0)).toBe(1.5)
  expect(scalePow().domain([0, 0]).range([2, 1])(1)).toBe(1.5)
})

it('pow(x) can map a bipow domain with two values to the corresponding range', () => {
  const s = scalePow().domain([1, 2])
  expect(s.domain()).toEqual([1, 2])
  expect(s(0.5)).toBe(-0.5)
  expect(s(1.0)).toBe( 0.0)
  expect(s(1.5)).toBe( 0.5)
  expect(s(2.0)).toBe( 1.0)
  expect(s(2.5)).toBe( 1.5)
  expect(s.invert(-0.5)).toBe(0.5)
  expect(s.invert( 0.0)).toBe(1.0)
  expect(s.invert( 0.5)).toBe(1.5)
  expect(s.invert( 1.0)).toBe(2.0)
  expect(s.invert( 1.5)).toBe(2.5)
})

it('pow(x) can map a polypow domain with more than two values to the corresponding range', () => {
  const s = scalePow().domain([-10, 0, 100]).range(['red', 'white', 'green'])
  expect(s.domain()).toEqual([-10, 0, 100])
  expect(s(-5)).toBe('rgb(255, 128, 128)')
  expect(s(50)).toBe('rgb(128, 192, 128)')
  expect(s(75)).toBe('rgb(64, 160, 64)')
  s.domain([4, 2, 1]).range([1, 2, 4])
  expect(s(1.5)).toBe(3)
  expect(s(3)).toBe(1.5)
  expect(s.invert(1.5)).toBe(3)
  expect(s.invert(3)).toBe(1.5)
  s.domain([1, 2, 4]).range([4, 2, 1])
  expect(s(1.5)).toBe(3)
  expect(s(3)).toBe(1.5)
  expect(s.invert(1.5)).toBe(3)
  expect(s.invert(3)).toBe(1.5)
})

it('pow.invert(y) maps a range value y to a domain value x', () => {
  expect(scalePow().range([1, 2]).invert(1.5)).toBe(0.5)
})

it('pow.invert(y) maps an empty range to the middle of the domain', () => {
  expect(scalePow().domain([1, 2]).range([0, 0]).invert(0)).toBe(1.5)
  expect(scalePow().domain([2, 1]).range([0, 0]).invert(1)).toBe(1.5)
})

it('pow.invert(y) coerces range values to numbers', () => {
  expect(scalePow().range(['0', '2']).invert('1')).toBe(0.5)
  const d0 = new Date(1990, 0, 1), d1 = new Date(1991, 0, 1)
  expect(scalePow().range([d0, d1]).invert(new Date(+d0 + (+d1 - +d0) / 2))).toBe(0.5)
})

it('pow.invert(y) returns NaN if the range is not coercible to number', () => {
  expect(isNaN(scalePow().range(['#000', '#fff']).invert('#999'))).toBe(true)
  expect(isNaN(scalePow().range([0, '#fff']).invert('#999'))).toBe(true)
})

it('pow.exponent(exponent) sets the exponent to the specified value', () => {
  const x = scalePow().exponent!(0.5).domain([1, 2])
  assertInDelta(x(1), 0, 1e-6)
  assertInDelta(x(1.5), 0.5425821, 1e-6)
  assertInDelta(x(2), 1, 1e-6)
  expect(x.exponent!()).toBe(0.5)
  x.exponent!(2).domain([1, 2])
  assertInDelta(x(1), 0, 1e-6)
  assertInDelta(x(1.5), 0.41666667, 1e-6)
  assertInDelta(x(2), 1, 1e-6)
  expect(x.exponent!()).toBe(2)
  x.exponent!(-1).domain([1, 2])
  assertInDelta(x(1), 0, 1e-6)
  assertInDelta(x(1.5), 0.6666667, 1e-6)
  assertInDelta(x(2), 1, 1e-6)
  expect(x.exponent!()).toBe(-1)
})

it('pow.exponent(exponent) changing the exponent does not change the domain or range', () => {
  const x = scalePow().domain([1, 2]).range([3, 4])
  x.exponent!(0.5)
  expect(x.domain()).toEqual([1, 2])
  expect(x.range()).toEqual([3, 4])
  x.exponent!(2)
  expect(x.domain()).toEqual([1, 2])
  expect(x.range()).toEqual([3, 4])
  x.exponent!(-1)
  expect(x.domain()).toEqual([1, 2])
  expect(x.range()).toEqual([3, 4])
})

it('pow.domain(domain) accepts an array of numbers', () => {
  expect(scalePow().domain([]).domain()).toEqual([])
  expect(scalePow().domain([1, 0]).domain()).toEqual([1, 0])
  expect(scalePow().domain([1, 2, 3]).domain()).toEqual([1, 2, 3])
})

it('pow.domain(domain) coerces domain values to numbers', () => {
  expect(scalePow().domain([new Date(1990, 0, 1), new Date(1991, 0, 1)]).domain()).toEqual([+new Date(1990, 0, 1), +new Date(1991, 0, 1)])
  expect(scalePow().domain(['0.0', '1.0']).domain()).toEqual([0, 1])
  expect(scalePow().domain([new Number(0), new Number(1)]).domain()).toEqual([0, 1])
})

it('pow.domain(domain) makes a copy of domain values', () => {
  const d = [1, 2], s = scalePow().domain(d)
  expect(s.domain()).toEqual([1, 2])
  d.push(3)
  expect(s.domain()).toEqual([1, 2])
  expect(d).toEqual([1, 2, 3])
})

it('pow.domain() returns a copy of domain values', () => {
  const s = scalePow(), d = s.domain()
  expect(d).toEqual([0, 1])
  d.push(3)
  expect(s.domain()).toEqual([0, 1])
})

it('pow.range(range) does not coerce range to numbers', () => {
  const s = scalePow().range(['0px', '2px'])
  expect(s.range()).toEqual(['0px', '2px'])
  expect(s(0.5)).toBe('1px')
})

it('pow.range(range) can accept range values as colors', () => {
  expect(scalePow().range(['red', 'blue'])(0.5)).toBe('rgb(128, 0, 128)')
  expect(scalePow().range(['#ff0000', '#0000ff'])(0.5)).toBe('rgb(128, 0, 128)')
  expect(scalePow().range(['#f00', '#00f'])(0.5)).toBe('rgb(128, 0, 128)')
  expect(scalePow().range(['rgb(255,0,0)', 'hsl(240,100%,50%)'])(0.5)).toBe('rgb(128, 0, 128)')
  expect(scalePow().range(['rgb(100%,0%,0%)', 'hsl(240,100%,50%)'])(0.5)).toBe('rgb(128, 0, 128)')
  expect(scalePow().range(['hsl(0,100%,50%)', 'hsl(240,100%,50%)'])(0.5)).toBe('rgb(128, 0, 128)')
})

it('pow.range(range) can accept range values as arrays or objects', () => {
  expect(scalePow().range([{color: 'red'}, {color: 'blue'}])(0.5)).toEqual({color: 'rgb(128, 0, 128)'})
  expect(scalePow().range([['red'], ['blue']])(0.5)).toEqual(['rgb(128, 0, 128)'])
})

it('pow.range(range) makes a copy of range values', () => {
  const r = [1, 2], s = scalePow().range(r)
  expect(s.range()).toEqual([1, 2])
  r.push(3)
  expect(s.range()).toEqual([1, 2])
  expect(r).toEqual([1, 2, 3])
})

it('pow.range() returns a copy of range values', () => {
  const s = scalePow(), r = s.range()
  expect(r).toEqual([0, 1])
  r.push(3)
  expect(s.range()).toEqual([0, 1])
})

it('pow.rangeRound(range) is an alias for pow.range(range).interpolate(interpolateRound)', () => {
  expect(scalePow().rangeRound([0, 10])(0.59)).toBe(6)
})

it('pow.clamp() is false by default', () => {
  expect(scalePow().clamp()).toBe(false)
  expect(scalePow().range([10, 20])(2)).toBe(30)
  expect(scalePow().range([10, 20])(-1)).toBe(0)
  expect(scalePow().range([10, 20]).invert(30)).toBe(2)
  expect(scalePow().range([10, 20]).invert(0)).toBe(-1)
})

it('pow.clamp(true) restricts output values to the range', () => {
  expect(scalePow().clamp(true).range([10, 20])(2)).toBe(20)
  expect(scalePow().clamp(true).range([10, 20])(-1)).toBe(10)
})

it('pow.clamp(true) restricts input values to the domain', () => {
  expect(scalePow().clamp(true).range([10, 20]).invert(30)).toBe(1)
  expect(scalePow().clamp(true).range([10, 20]).invert(0)).toBe(0)
})

it('pow.clamp(clamp) coerces the specified clamp value to a boolean', () => {
  expect(scalePow().clamp('true').clamp()).toBe(true)
  expect(scalePow().clamp(1).clamp()).toBe(true)
  expect(scalePow().clamp('').clamp()).toBe(false)
  expect(scalePow().clamp(0).clamp()).toBe(false)
})

it('pow.interpolate(interpolate) takes a custom interpolator factory', () => {
  function interpolate(a: any, b: any) { return function(t: number) { return [a, b, t] } }
  const s = scalePow().domain([10, 20]).range(['a', 'b']).interpolate(interpolate)
  expect(s.interpolate()).toBe(interpolate)
  expect(s(15)).toEqual(['a', 'b', 0.5])
})

it('pow.nice() is an alias for pow.nice(10)', () => {
  expect(scalePow().domain([0, 0.96]).nice().domain()).toEqual([0, 1])
  expect(scalePow().domain([0, 96]).nice().domain()).toEqual([0, 100])
})

it('pow.nice(count) extends the domain to match the desired ticks', () => {
  expect(scalePow().domain([0, 0.96]).nice(10).domain()).toEqual([0, 1])
  expect(scalePow().domain([0, 96]).nice(10).domain()).toEqual([0, 100])
  expect(scalePow().domain([0.96, 0]).nice(10).domain()).toEqual([1, 0])
  expect(scalePow().domain([96, 0]).nice(10).domain()).toEqual([100, 0])
  expect(scalePow().domain([0, -0.96]).nice(10).domain()).toEqual([0, -1])
  expect(scalePow().domain([0, -96]).nice(10).domain()).toEqual([0, -100])
  expect(scalePow().domain([-0.96, 0]).nice(10).domain()).toEqual([-1, 0])
  expect(scalePow().domain([-96, 0]).nice(10).domain()).toEqual([-100, 0])
})

it('pow.nice(count) nices the domain, extending it to round numbers', () => {
  expect(scalePow().domain([1.1, 10.9]).nice(10).domain()).toEqual([1, 11])
  expect(scalePow().domain([10.9, 1.1]).nice(10).domain()).toEqual([11, 1])
  expect(scalePow().domain([0.7, 11.001]).nice(10).domain()).toEqual([0, 12])
  expect(scalePow().domain([123.1, 6.7]).nice(10).domain()).toEqual([130, 0])
  expect(scalePow().domain([0, 0.49]).nice(10).domain()).toEqual([0, 0.5])
})

it('pow.nice(count) has no effect on degenerate domains', () => {
  expect(scalePow().domain([0, 0]).nice(10).domain()).toEqual([0, 0])
  expect(scalePow().domain([0.5, 0.5]).nice(10).domain()).toEqual([0.5, 0.5])
})

it('pow.nice(count) nicing a polypow domain only affects the extent', () => {
  expect(scalePow().domain([1.1, 1, 2, 3, 10.9]).nice(10).domain()).toEqual([1, 1, 2, 3, 11])
  expect(scalePow().domain([123.1, 1, 2, 3, -0.9]).nice(10).domain()).toEqual([130, 1, 2, 3, -10])
})

it('pow.nice(count) accepts a tick count to control nicing step', () => {
  expect(scalePow().domain([12, 87]).nice!(5).domain()).toEqual([0, 100])
  expect(scalePow().domain([12, 87]).nice(10).domain()).toEqual([10, 90])
  expect(scalePow().domain([12, 87]).nice(100).domain()).toEqual([12, 87])
})

it('pow.ticks(count) returns the expected ticks for an ascending domain', () => {
  const s = scalePow()
  expect(s.ticks!(10).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
  s.domain([-100, 100])
  expect(s.ticks!(10)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100])
})

it('pow.ticks(count) returns the empty array if count is not a positive integer', () => {
  const s = scalePow()
  expect(s.ticks!(NaN)).toEqual([])
  expect(s.ticks!(0)).toEqual([])
  expect(s.ticks!(-1)).toEqual([])
  expect(s.ticks!(Infinity)).toEqual([])
})

it('pow.ticks() is an alias for pow.ticks(10)', () => {
  const s = scalePow()
  expect(s.ticks!()).toEqual(s.ticks!(10))
})

it('pow.tickFormat() is an alias for pow.tickFormat(10)', () => {
  expect(scalePow().tickFormat!()(0.2)).toBe('0.2')
  expect(scalePow().domain([-100, 100]).tickFormat()(-20)).toBe('\u221220')
})

it('pow.tickFormat(count) returns a format suitable for the ticks', () => {
  expect(scalePow().tickFormat!(10)(0.2)).toBe('0.2')
  expect(scalePow().tickFormat!(20)(0.2)).toBe('0.20')
  expect(scalePow().domain([-100, 100]).tickFormat(10)(-20)).toBe('\u221220')
})

it('pow.copy() returns a copy with changes to the domain are isolated', () => {
  const x = scalePow(), y = x.copy()
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

it('pow.copy() returns a copy with changes to clamping are isolated', () => {
  const x = scalePow().clamp(true), y = x.copy()
  x.clamp(false)
  expect(x(2)).toBe(2)
  expect(y(2)).toBe(1)
  expect(y.clamp()).toBe(true)
  y.clamp(false)
  expect(x(2)).toBe(2)
  expect(y(2)).toBe(2)
  expect(x.clamp()).toBe(false)
})

it('pow().clamp(true).invert(x) cannot return a value outside the domain', () => {
  const x = scalePow().exponent!(0.5).domain([1, 20]).clamp(true)
  expect(x.invert(0)).toBe(1)
  expect(x.invert(1)).toBe(20)
})

it('scaleSqrt() is an alias for pow().exponent(0.5)', () => {
  const s = scaleSqrt()
  expect(s.exponent!()).toBe(0.5)
  assertInDelta(s(0.5), Math.SQRT1_2, 1e-6)
  assertInDelta(s.invert(Math.SQRT1_2), 0.5, 1e-6)
})
