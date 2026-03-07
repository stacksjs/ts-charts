import { expect, it } from 'bun:test'
import { interpolate, interpolateHsl } from '@ts-charts/interpolate'
import { format } from '@ts-charts/format'
import { scaleLog } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number = 1e-6) {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

function round(x: number): number {
  return Math.round(x * 1e12) / 1e12
}

it('scaleLog() has the expected defaults', () => {
  const x = scaleLog()
  expect(x.domain()).toEqual([1, 10])
  expect(x.range()).toEqual([0, 1])
  expect(x.clamp()).toBe(false)
  expect(x.base()).toBe(10)
  expect(x.interpolate()).toBe(interpolate)
  expect(x.interpolate()({array: ['red']}, {array: ['blue']})(0.5)).toEqual({array: ['rgb(128, 0, 128)']})
  assertInDelta(x(5), 0.69897)
  assertInDelta(x.invert(0.69897), 5)
  assertInDelta(x(3.162278), 0.5)
  assertInDelta(x.invert(0.5), 3.162278)
})

it('log.domain(...) coerces values to numbers', () => {
  const x = scaleLog().domain([new Date(1990, 0, 1), new Date(1991, 0, 1)])
  expect(typeof x.domain()[0]).toBe('number')
  expect(typeof x.domain()[1]).toBe('number')
  assertInDelta(x(new Date(1989,  9, 20)), -0.2061048)
  assertInDelta(x(new Date(1990,  0,  1)),  0.0000000)
  assertInDelta(x(new Date(1990,  2, 15)),  0.2039385)
  assertInDelta(x(new Date(1990,  4, 27)),  0.4057544)
  assertInDelta(x(new Date(1991,  0,  1)),  1.0000000)
  assertInDelta(x(new Date(1991,  2, 15)),  1.1942797)
  x.domain(['1', '10'])
  expect(typeof x.domain()[0]).toBe('number')
  expect(typeof x.domain()[1]).toBe('number')
  assertInDelta(x(5), 0.69897)
  x.domain([new Number(1), new Number(10)])
  expect(typeof x.domain()[0]).toBe('number')
  expect(typeof x.domain()[1]).toBe('number')
  assertInDelta(x(5), 0.69897)
})

it('log.domain(...) can take negative values', () => {
  const x = scaleLog().domain([-100, -1])
  expect(x.ticks().map(x.tickFormat(Infinity))).toEqual([
    '\u2212100',
    '\u221290', '\u221280', '\u221270', '\u221260', '\u221250', '\u221240', '\u221230', '\u221220', '\u221210',
    '\u22129', '\u22128', '\u22127', '\u22126', '\u22125', '\u22124', '\u22123', '\u22122', '\u22121'
  ])
  assertInDelta(x(-50), 0.150515)
})

it('log.domain(...).range(...) can take more than two values', () => {
  const x = scaleLog().domain([0.1, 1, 100]).range(['red', 'white', 'green'])
  expect(x(0.5)).toBe('rgb(255, 178, 178)')
  expect(x(50)).toBe('rgb(38, 147, 38)')
  expect(x(75)).toBe('rgb(16, 136, 16)')
})

it('log.domain(...) preserves specified domain exactly, with no floating point error', () => {
  const x = scaleLog().domain([0.1, 1000])
  expect(x.domain()).toEqual([0.1, 1000])
})

it('log.ticks(...) returns exact ticks, with no floating point error', () => {
  expect(scaleLog().domain([0.15, 0.68]).ticks()).toEqual([0.2, 0.3, 0.4, 0.5, 0.6])
  expect(scaleLog().domain([0.68, 0.15]).ticks()).toEqual([0.6, 0.5, 0.4, 0.3, 0.2])
  expect(scaleLog().domain([-0.15, -0.68]).ticks()).toEqual([-0.2, -0.3, -0.4, -0.5, -0.6])
  expect(scaleLog().domain([-0.68, -0.15]).ticks()).toEqual([-0.6, -0.5, -0.4, -0.3, -0.2])
})

it('log.range(...) does not coerce values to numbers', () => {
  const x = scaleLog().range(['0', '2'])
  expect(typeof x.range()[0]).toBe('string')
  expect(typeof x.range()[1]).toBe('string')
})

it('log.range(...) can take colors', () => {
  const x = scaleLog().range(['red', 'blue'])
  expect(x(5)).toBe('rgb(77, 0, 178)')
  x.range(['#ff0000', '#0000ff'])
  expect(x(5)).toBe('rgb(77, 0, 178)')
  x.range(['#f00', '#00f'])
  expect(x(5)).toBe('rgb(77, 0, 178)')
  x.range(['hsl(0,100%,50%)', 'hsl(240,100%,50%)'])
  expect(x(5)).toBe('rgb(77, 0, 178)')
})

it('log.range(...) can take arrays or objects', () => {
  const x = scaleLog().range([{color: 'red'}, {color: 'blue'}])
  expect(x(5)).toEqual({color: 'rgb(77, 0, 178)'})
  x.range([['red'], ['blue']])
  expect(x(5)).toEqual(['rgb(77, 0, 178)'])
})

it('log.interpolate(f) sets the interpolator', () => {
  const x = scaleLog().range(['red', 'blue'])
  expect(x.interpolate()).toBe(interpolate)
  expect(x(5)).toBe('rgb(77, 0, 178)')
  x.interpolate(interpolateHsl)
  expect(x(5)).toBe('rgb(154, 0, 255)')
})

it('log(x) does not clamp by default', () => {
  const x = scaleLog()
  expect(x.clamp()).toBe(false)
  assertInDelta(x(0.5), -0.3010299)
  assertInDelta(x(15), 1.1760913)
})

it('log.clamp(true)(x) clamps to the domain', () => {
  const x = scaleLog().clamp(true)
  assertInDelta(x(-1), 0)
  assertInDelta(x(5), 0.69897)
  assertInDelta(x(15), 1)
  x.domain([10, 1])
  assertInDelta(x(-1), 1)
  assertInDelta(x(5), 0.30103)
  assertInDelta(x(15), 0)
})

it('log.clamp(true).invert(y) clamps to the range', () => {
  const x = scaleLog().clamp(true)
  assertInDelta(x.invert(-0.1), 1)
  assertInDelta(x.invert(0.69897), 5)
  assertInDelta(x.invert(1.5), 10)
  x.domain([10, 1])
  assertInDelta(x.invert(-0.1), 10)
  assertInDelta(x.invert(0.30103), 5)
  assertInDelta(x.invert(1.5), 1)
})

it('log(x) maps a number x to a number y', () => {
  const x = scaleLog().domain([1, 2])
  assertInDelta(x(0.5), -1.0000000)
  assertInDelta(x(1.0),  0.0000000)
  assertInDelta(x(1.5),  0.5849625)
  assertInDelta(x(2.0),  1.0000000)
  assertInDelta(x(2.5),  1.3219281)
})

it('log.invert(y) maps a number y to a number x', () => {
  const x = scaleLog().domain([1, 2])
  assertInDelta(x.invert(-1.0000000), 0.5)
  assertInDelta(x.invert( 0.0000000), 1.0)
  assertInDelta(x.invert( 0.5849625), 1.5)
  assertInDelta(x.invert( 1.0000000), 2.0)
  assertInDelta(x.invert( 1.3219281), 2.5)
})

it('log.invert(y) coerces y to number', () => {
  const x = scaleLog().range(['0', '2'])
  assertInDelta(x.invert('1'), 3.1622777)
  x.range([new Date(1990, 0, 1), new Date(1991, 0, 1)])
  assertInDelta(x.invert(new Date(1990, 6, 2, 13)), 3.1622777)
  x.range(['#000', '#fff'])
  expect(Number.isNaN(x.invert('#999'))).toBe(true)
})

it('log.base(b) sets the log base, changing the ticks', () => {
  const x = scaleLog().domain([1, 32])
  expect(x.base(2).ticks().map(x.tickFormat())).toEqual(['1', '2', '4', '8', '16', '32'])
  expect(x.base(Math.E).ticks().map(x.tickFormat())).toEqual(['1', '2.71828182846', '7.38905609893', '20.0855369232'])
})

it('log.nice() nices the domain, extending it to powers of ten', () => {
  const x = scaleLog().domain([1.1, 10.9]).nice()
  expect(x.domain()).toEqual([1, 100])
  x.domain([10.9, 1.1]).nice()
  expect(x.domain()).toEqual([100, 1])
  x.domain([0.7, 11.001]).nice()
  expect(x.domain()).toEqual([0.1, 100])
  x.domain([123.1, 6.7]).nice()
  expect(x.domain()).toEqual([1000, 1])
  x.domain([0.01, 0.49]).nice()
  expect(x.domain()).toEqual([0.01, 1])
  x.domain([1.5, 50]).nice()
  expect(x.domain()).toEqual([1, 100])
  assertInDelta(x(1), 0)
  assertInDelta(x(100), 1)
})

it('log.nice() works on degenerate domains', () => {
  const x = scaleLog().domain([0, 0]).nice()
  expect(x.domain()).toEqual([0, 0])
  x.domain([0.5, 0.5]).nice()
  expect(x.domain()).toEqual([0.1, 1])
})

it('log.nice() on a polylog domain only affects the extent', () => {
  const x = scaleLog().domain([1.1, 1.5, 10.9]).nice()
  expect(x.domain()).toEqual([1, 1.5, 100])
  x.domain([-123.1, -1.5, -0.5]).nice()
  expect(x.domain()).toEqual([-1000, -1.5, -0.1])
})

it('log.copy() isolates changes to the domain', () => {
  const x = scaleLog(), y = x.copy()
  x.domain([10, 100])
  expect(y.domain()).toEqual([1, 10])
  assertInDelta(x(10), 0)
  assertInDelta(y(1), 0)
  y.domain([100, 1000])
  assertInDelta(x(100), 1)
  assertInDelta(y(100), 0)
  expect(x.domain()).toEqual([10, 100])
  expect(y.domain()).toEqual([100, 1000])
})

it('log.copy() isolates changes to the domain via nice', () => {
  const x = scaleLog().domain([1.5, 50]), y = x.copy().nice()
  expect(x.domain()).toEqual([1.5, 50])
  assertInDelta(x(1.5), 0)
  assertInDelta(x(50), 1)
  assertInDelta(x.invert(0), 1.5)
  assertInDelta(x.invert(1), 50)
  expect(y.domain()).toEqual([1, 100])
  assertInDelta(y(1), 0)
  assertInDelta(y(100), 1)
  assertInDelta(y.invert(0), 1)
  assertInDelta(y.invert(1), 100)
})

it('log.copy() isolates changes to the range', () => {
  const x = scaleLog(), y = x.copy()
  x.range([1, 2])
  assertInDelta(x.invert(1), 1)
  assertInDelta(y.invert(1), 10)
  expect(y.range()).toEqual([0, 1])
  y.range([2, 3])
  assertInDelta(x.invert(2), 10)
  assertInDelta(y.invert(2), 1)
  expect(x.range()).toEqual([1, 2])
  expect(y.range()).toEqual([2, 3])
})

it('log.copy() isolates changes to the interpolator', () => {
  const x = scaleLog().range(['red', 'blue']), y = x.copy()
  x.interpolate(interpolateHsl)
  expect(x(5)).toBe('rgb(154, 0, 255)')
  expect(y(5)).toBe('rgb(77, 0, 178)')
  expect(y.interpolate()).toBe(interpolate)
})

it('log.copy() isolates changes to clamping', () => {
  const x = scaleLog().clamp(true), y = x.copy()
  x.clamp(false)
  assertInDelta(x(0.5), -0.30103)
  assertInDelta(y(0.5), 0)
  expect(y.clamp()).toBe(true)
  y.clamp(false)
  assertInDelta(x(20), 1.30103)
  assertInDelta(y(20), 1.30103)
  expect(x.clamp()).toBe(false)
})

it('log.ticks() generates the expected power-of-ten for ascending ticks', () => {
  const s = scaleLog()
  expect(s.domain([1e-1, 1e1]).ticks().map(round)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  expect(s.domain([1e-1, 1e0]).ticks().map(round)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
  expect(s.domain([-1e0, -1e-1]).ticks().map(round)).toEqual([-1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1])
})

it('log.ticks() generates the expected power-of-ten ticks for descending domains', () => {
  const s = scaleLog()
  expect(s.domain([-1e-1, -1e1]).ticks().map(round)).toEqual([-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1].reverse())
  expect(s.domain([-1e-1, -1e0]).ticks().map(round)).toEqual([-1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1].reverse())
  expect(s.domain([1e0, 1e-1]).ticks().map(round)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].reverse())
})

it('log.ticks() generates the expected power-of-ten ticks for small domains', () => {
  const s = scaleLog()
  expect(s.domain([1, 5]).ticks()).toEqual([1, 2, 3, 4, 5])
  expect(s.domain([5, 1]).ticks()).toEqual([5, 4, 3, 2, 1])
  expect(s.domain([-1, -5]).ticks()).toEqual([-1, -2, -3, -4, -5])
  expect(s.domain([-5, -1]).ticks()).toEqual([-5, -4, -3, -2, -1])
  expect(s.domain([286.9252014, 329.4978332]).ticks(1)).toEqual([300])
  expect(s.domain([286.9252014, 329.4978332]).ticks(2)).toEqual([300])
  expect(s.domain([286.9252014, 329.4978332]).ticks(3)).toEqual([300, 320])
  expect(s.domain([286.9252014, 329.4978332]).ticks(4)).toEqual([290, 300, 310, 320])
  expect(s.domain([286.9252014, 329.4978332]).ticks()).toEqual([290, 295, 300, 305, 310, 315, 320, 325])
})

it('log.ticks() generates linear ticks when the domain extent is small', () => {
  const s = scaleLog()
  expect(s.domain([41, 42]).ticks()).toEqual([41, 41.1, 41.2, 41.3, 41.4, 41.5, 41.6, 41.7, 41.8, 41.9, 42])
  expect(s.domain([42, 41]).ticks()).toEqual([42, 41.9, 41.8, 41.7, 41.6, 41.5, 41.4, 41.3, 41.2, 41.1, 41])
  expect(s.domain([1600, 1400]).ticks()).toEqual([1600, 1580, 1560, 1540, 1520, 1500, 1480, 1460, 1440, 1420, 1400])
})

it('log.base(base).ticks() generates the expected power-of-base ticks', () => {
  const s = scaleLog().base(Math.E)
  expect(s.domain([0.1, 100]).ticks().map(round)).toEqual([0.135335283237, 0.367879441171, 1, 2.718281828459, 7.389056098931, 20.085536923188, 54.598150033144])
})

it('log.tickFormat() is equivalent to log.tickFormat(10)', () => {
  const s = scaleLog()
  expect(s.domain([1e-1, 1e1]).ticks().map(s.tickFormat())).toEqual(['100m', '200m', '300m', '400m', '500m', '', '', '', '', '1', '2', '3', '4', '5', '', '', '', '', '10'])
})

it('log.tickFormat(count) returns a filtered "s" format', () => {
  const s = scaleLog(), t = s.domain([1e-1, 1e1]).ticks()
  expect(t.map(s.tickFormat(10))).toEqual(['100m', '200m', '300m', '400m', '500m', '', '', '', '', '1', '2', '3', '4', '5', '', '', '', '', '10'])
  expect(t.map(s.tickFormat(5))).toEqual(['100m', '200m', '', '', '', '', '', '', '', '1', '2', '', '', '', '', '', '', '', '10'])
  expect(t.map(s.tickFormat(1))).toEqual(['100m', '', '', '', '', '', '', '', '', '1', '', '', '', '', '', '', '', '', '10'])
  expect(t.map(s.tickFormat(0))).toEqual(['100m', '', '', '', '', '', '', '', '', '1', '', '', '', '', '', '', '', '', '10'])
})

it('log.tickFormat(count, format) returns the specified format, filtered', () => {
  const s = scaleLog(), t = s.domain([1e-1, 1e1]).ticks()
  expect(t.map(s.tickFormat(10, '+'))).toEqual(['+0.1', '+0.2', '+0.3', '+0.4', '+0.5', '', '', '', '', '+1', '+2', '+3', '+4', '+5', '', '', '', '', '+10'])
})

it('log.base(base).tickFormat() returns the "," format', () => {
  const s = scaleLog().base(Math.E)
  expect(s.domain([1e-1, 1e1]).ticks().map(s.tickFormat())).toEqual(['0.135335283237', '0.367879441171', '1', '2.71828182846', '7.38905609893'])
})

it('log.base(base).tickFormat(count) returns a filtered "," format', () => {
  const s = scaleLog().base(16), t = s.domain([1e-1, 1e1]).ticks()
  expect(t.map(s.tickFormat(10))).toEqual(['0.125', '0.1875', '0.25', '0.3125', '0.375', '', '', '', '', '', '', '', '', '', '1', '2', '3', '4', '5', '6', '', '', '', ''])
  expect(t.map(s.tickFormat(5))).toEqual(['0.125', '0.1875', '', '', '', '', '', '', '', '', '', '', '', '', '1', '2', '3', '', '', '', '', '', '', ''])
  expect(t.map(s.tickFormat(1))).toEqual(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '1', '', '', '', '', '', '', '', '', ''])
})

it('log.ticks() generates log ticks', () => {
  const x = scaleLog()
  expect(x.ticks().map(x.tickFormat(Infinity))).toEqual([
    '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '10'
  ])
  x.domain([100, 1])
  expect(x.ticks().map(x.tickFormat(Infinity))).toEqual([
    '100',
    '90', '80', '70', '60', '50', '40', '30', '20', '10',
    '9', '8', '7', '6', '5', '4', '3', '2', '1'
  ])
  x.domain([0.49999, 0.006029505943610648])
  expect(x.ticks().map(x.tickFormat(Infinity))).toEqual([
    '400m', '300m', '200m', '100m',
    '90m', '80m', '70m', '60m', '50m', '40m', '30m', '20m', '10m',
    '9m', '8m', '7m'
  ])
  x.domain([0.95, 1.05e8])
  expect(x.ticks().map(x.tickFormat(8)).filter(String)).toEqual([
    '1', '10', '100', '1k', '10k', '100k', '1M', '10M', '100M'
  ])
})

it('log.tickFormat(count) filters ticks to about count', () => {
  const x = scaleLog()
  expect(x.ticks().map(x.tickFormat(5))).toEqual([
    '1', '2', '3', '4', '5', '', '', '', '',
    '10'
  ])
  x.domain([100, 1])
  expect(x.ticks().map(x.tickFormat(10))).toEqual([
    '100',
    '', '', '', '', '50', '40', '30', '20', '10',
    '', '', '', '', '5', '4', '3', '2', '1'
  ])
})

it('log.ticks(count) filters powers-of-ten ticks for huge domains', () => {
  const x = scaleLog().domain([1e10, 1])
  expect(x.ticks().map(x.tickFormat())).toEqual(['10G', '1G', '100M', '10M', '1M', '100k', '10k', '1k', '100', '10', '1'])
  x.domain([1e-29, 1e-1])
  expect(x.ticks().map(x.tickFormat())).toEqual(['0.0001y', '0.01y', '1y', '100y', '10z', '1a', '100a', '10f', '1p', '100p', '10n', '1\u00b5', '100\u00b5', '10m'])
})

it('log.ticks() generates ticks that cover the domain', () => {
  const x = scaleLog().domain([0.01, 10000])
  expect(x.ticks(20).map(x.tickFormat(20))).toEqual([
    '10m', '20m', '30m', '', '', '', '', '', '',
    '100m', '200m', '300m', '', '', '', '', '', '',
    '1', '2', '3', '', '', '', '', '', '',
    '10', '20', '30', '', '', '', '', '', '',
    '100', '200', '300', '', '', '', '', '', '',
    '1k', '2k', '3k', '', '', '', '', '', '',
    '10k'
  ])
})

it('log.ticks() generates ticks that cover the niced domain', () => {
  const x = scaleLog().domain([0.0124123, 1230.4]).nice()
  expect(x.ticks(20).map(x.tickFormat(20))).toEqual([
    '10m', '20m', '30m', '', '', '', '', '', '',
    '100m', '200m', '300m', '', '', '', '', '', '',
    '1', '2', '3', '', '', '', '', '', '',
    '10', '20', '30', '', '', '', '', '', '',
    '100', '200', '300', '', '', '', '', '', '',
    '1k', '2k', '3k', '', '', '', '', '', '',
    '10k'
  ])
})

it('log.tickFormat(count, format) returns a filtered format', () => {
  const x = scaleLog().domain([1000.1, 1])
  expect(x.ticks().map(x.tickFormat(10, format('+,d')))).toEqual([
    '+1,000',
    '', '', '', '', '', '', '+300', '+200', '+100',
    '', '', '', '', '', '', '+30', '+20', '+10',
    '', '', '', '', '', '', '+3', '+2', '+1'
  ])
})

it('log.tickFormat(count, specifier) returns a filtered format', () => {
  const x = scaleLog().domain([1000.1, 1])
  expect(x.ticks().map(x.tickFormat(10, 's'))).toEqual([
    '1k',
    '', '', '', '', '', '', '300', '200', '100',
    '', '', '', '', '', '', '30', '20', '10',
    '', '', '', '', '', '', '3', '2', '1'
  ])
})

it('log.tickFormat(count, specifier) trims trailing zeroes by default', () => {
  const x = scaleLog().domain([100.1, 0.02])
  expect(x.ticks().map(x.tickFormat(10, 'f'))).toEqual([
    '100',
    '', '', '', '', '', '', '', '20', '10',
    '', '', '', '', '', '', '', '2', '1',
    '', '', '', '', '', '', '', '0.2', '0.1',
    '', '', '', '', '', '', '', '0.02'
  ])
})

it('log.tickFormat(count, specifier) with base two trims trailing zeroes by default', () => {
  const x = scaleLog().base(2).domain([100.1, 0.02])
  expect(x.ticks().map(x.tickFormat(10, 'f'))).toEqual([
    '64', '32', '16', '8', '4', '2', '1', '0.5', '0.25', '0.125', '0.0625', '0.03125'
  ])
})

it('log.tickFormat(count, specifier) preserves trailing zeroes if needed', () => {
  const x = scaleLog().domain([100.1, 0.02])
  expect(x.ticks().map(x.tickFormat(10, '.1f'))).toEqual([
    '100.0',
    '', '', '', '', '', '', '', '20.0', '10.0',
    '', '', '', '', '', '', '', '2.0', '1.0',
    '', '', '', '', '', '', '', '0.2', '0.1',
    '', '', '', '', '', '', '', '0.0'
  ])
})

it('log.ticks() returns the empty array when the domain is degenerate', () => {
  const x = scaleLog()
  expect(x.domain([0, 1]).ticks()).toEqual([])
  expect(x.domain([1, 0]).ticks()).toEqual([])
  expect(x.domain([0, -1]).ticks()).toEqual([])
  expect(x.domain([-1, 0]).ticks()).toEqual([])
  expect(x.domain([-1, 1]).ticks()).toEqual([])
  expect(x.domain([0, 0]).ticks()).toEqual([])
})
