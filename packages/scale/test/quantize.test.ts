import { expect, it } from 'bun:test'
import { range } from '@ts-charts/array'
import { scaleQuantize } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number = 1e-6) {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

it('scaleQuantize() has the expected defaults', () => {
  const s = scaleQuantize()
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([0, 1])
  expect((s.thresholds as Function)()).toEqual([0.5])
  expect(s(0.25)).toBe(0)
  expect(s(0.75)).toBe(1)
})

it('quantize(value) maps a number to a discrete value in the range', () => {
  const s = scaleQuantize().range([0, 1, 2])
  expect((s.thresholds as Function)()).toEqual([1 / 3, 2 / 3])
  expect(s(0.0)).toBe(0)
  expect(s(0.2)).toBe(0)
  expect(s(0.4)).toBe(1)
  expect(s(0.6)).toBe(1)
  expect(s(0.8)).toBe(2)
  expect(s(1.0)).toBe(2)
})

it('quantize(value) clamps input values to the domain', () => {
  const a = {}
  const b = {}
  const c = {}
  const s = scaleQuantize().range([a, b, c])
  expect(s(-0.5)).toBe(a)
  expect(s(+1.5)).toBe(c)
})

it('quantize.unknown(value) sets the return value for undefined, null, and NaN input', () => {
  const s = scaleQuantize().range([0, 1, 2]).unknown(-1)
  expect(s(undefined)).toBe(-1)
  expect(s(null)).toBe(-1)
  expect(s(NaN)).toBe(-1)
})

it('quantize.domain() coerces domain values to numbers', () => {
  const s = scaleQuantize().domain(['-1.20', '2.40'])
  expect(s.domain()).toEqual([-1.2, 2.4])
  expect(s(-1.2)).toBe(0)
  expect(s( 0.5)).toBe(0)
  expect(s( 0.7)).toBe(1)
  expect(s( 2.4)).toBe(1)
})

it('quantize.domain() accepts an iterable', () => {
  const s = scaleQuantize().domain(new Set([1, 2]))
  expect(s.domain()).toEqual([1, 2])
})

it('quantize.domain() only considers the first and second element of the domain', () => {
  const s = scaleQuantize().domain([-1, 100, 200])
  expect(s.domain()).toEqual([-1, 100])
})

it('quantize.range() cardinality determines the degree of quantization', () => {
  const s = scaleQuantize()
  assertInDelta(s.range(range(0, 1.001, 0.001))(1/3), 0.333, 1e-6)
  assertInDelta(s.range(range(0, 1.010, 0.010))(1/3), 0.330, 1e-6)
  assertInDelta(s.range(range(0, 1.100, 0.100))(1/3), 0.300, 1e-6)
  assertInDelta(s.range(range(0, 1.200, 0.200))(1/3), 0.400, 1e-6)
  assertInDelta(s.range(range(0, 1.250, 0.250))(1/3), 0.250, 1e-6)
  assertInDelta(s.range(range(0, 1.500, 0.500))(1/3), 0.500, 1e-6)
  assertInDelta(s.range(range(1))(1/3), 0, 1e-6)
})

it('quantize.range() values are arbitrary', () => {
  const a = {}
  const b = {}
  const c = {}
  const s = scaleQuantize().range([a, b, c])
  expect(s(0.0)).toBe(a)
  expect(s(0.2)).toBe(a)
  expect(s(0.4)).toBe(b)
  expect(s(0.6)).toBe(b)
  expect(s(0.8)).toBe(c)
  expect(s(1.0)).toBe(c)
})

it('quantize.invertExtent() maps a value in the range to a domain extent', () => {
  const s = scaleQuantize().range([0, 1, 2, 3])
  expect((s.invertExtent as Function)(0)).toEqual([0.00, 0.25])
  expect((s.invertExtent as Function)(1)).toEqual([0.25, 0.50])
  expect((s.invertExtent as Function)(2)).toEqual([0.50, 0.75])
  expect((s.invertExtent as Function)(3)).toEqual([0.75, 1.00])
})

it('quantize.invertExtent() allows arbitrary range values', () => {
  const a = {}
  const b = {}
  const s = scaleQuantize().range([a, b])
  expect((s.invertExtent as Function)(a)).toEqual([0.0, 0.5])
  expect((s.invertExtent as Function)(b)).toEqual([0.5, 1.0])
})

it('quantize.invertExtent() returns [NaN, NaN] when the given value is not in the range', () => {
  const s = scaleQuantize()
  expect((s.invertExtent as Function)(-1).every(Number.isNaN)).toBe(true)
  expect((s.invertExtent as Function)(0.5).every(Number.isNaN)).toBe(true)
  expect((s.invertExtent as Function)(2).every(Number.isNaN)).toBe(true)
  expect((s.invertExtent as Function)('a').every(Number.isNaN)).toBe(true)
})

it('quantize.invertExtent() returns the first match if duplicate values exist in the range', () => {
  const s = scaleQuantize().range([0, 1, 2, 0])
  expect((s.invertExtent as Function)(0)).toEqual([0.00, 0.25])
  expect((s.invertExtent as Function)(1)).toEqual([0.25, 0.50])
})

it('quantize.invertExtent(y) is exactly consistent with quantize(x)', () => {
  const s = scaleQuantize().domain([4.2, 6.2]).range(range(10))
  s.range().forEach(function(y: any) {
    const e = (s.invertExtent as Function)(y)
    expect(s(e[0])).toBe(y)
    expect(s(e[1])).toBe(y < 9 ? y + 1 : y)
  })
})
