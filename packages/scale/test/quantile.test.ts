import { expect, it } from 'bun:test'
import { scaleQuantile } from '../src/index.ts'

it('scaleQuantile() has the expected default', () => {
  const s = scaleQuantile()
  expect(s.domain()).toEqual([])
  expect(s.range()).toEqual([])
  expect(s.unknown()).toBe(undefined)
})

it('quantile(x) uses the R-7 algorithm to compute quantiles', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range([0, 1, 2, 3])
  expect([3, 6, 6.9, 7, 7.1].map(s)).toEqual([0, 0, 0, 0, 0])
  expect([8, 8.9].map(s)).toEqual([1, 1])
  expect([9, 9.1, 10, 13].map(s)).toEqual([2, 2, 2, 2])
  expect([14.9, 15, 15.1, 16, 20].map(s)).toEqual([3, 3, 3, 3, 3])
  s.domain([3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20]).range([0, 1, 2, 3])
  expect([3, 6, 6.9, 7, 7.1].map(s)).toEqual([0, 0, 0, 0, 0])
  expect([8, 8.9].map(s)).toEqual([1, 1])
  expect([9, 9.1, 10, 13].map(s)).toEqual([2, 2, 2, 2])
  expect([14.9, 15, 15.1, 16, 20].map(s)).toEqual([3, 3, 3, 3, 3])
})

it('quantile(x) returns undefined if the input value is NaN', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range([0, 1, 2, 3])
  expect(s(NaN)).toBe(undefined)
})

it('quantile.domain() values are sorted in ascending order', () => {
  const s = scaleQuantile().domain([6, 3, 7, 8, 8, 13, 20, 15, 16, 10])
  expect(s.domain()).toEqual([3, 6, 7, 8, 8, 10, 13, 15, 16, 20])
})

it('quantile.domain() values are coerced to numbers', () => {
  const s = scaleQuantile().domain(['6', '13', '20'])
  expect(s.domain()).toEqual([6, 13, 20])
})

it('quantile.domain() accepts an iterable', () => {
  const s = scaleQuantile().domain(new Set([6, 13, 20]))
  expect(s.domain()).toEqual([6, 13, 20])
})

it('quantile.domain() values are allowed to be zero', () => {
  const s = scaleQuantile().domain([1, 2, 0, 0, null])
  expect(s.domain()).toEqual([0, 0, 1, 2])
})

it('quantile.domain() non-numeric values are ignored', () => {
  const s = scaleQuantile().domain([6, 3, NaN, undefined, 7, 8, 8, 13, null, 20, 15, 16, 10, NaN])
  expect(s.domain()).toEqual([3, 6, 7, 8, 8, 10, 13, 15, 16, 20])
})

it('quantile.quantiles() returns the inner thresholds', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range([0, 1, 2, 3])
  expect(s.quantiles()).toEqual([7.25, 9, 14.5])
  s.domain([3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20]).range([0, 1, 2, 3])
  expect(s.quantiles()).toEqual([7.5, 9, 14])
})

it('quantile.range() cardinality determines the number of quantiles', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20])
  expect(s.range([0, 1, 2, 3]).quantiles()).toEqual([7.25, 9, 14.5])
  expect(s.range([0, 1]).quantiles()).toEqual([9])
  expect(s.range([,,,,,]).quantiles()).toEqual([6.8, 8, 11.2, 15.2])
  expect(s.range([,,,,,,]).quantiles()).toEqual([6.5, 8, 9, 13, 15.5])
})

it('quantile.range() accepts an iterable', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range(new Set([0, 1, 2, 3]))
  expect(s.range()).toEqual([0, 1, 2, 3])
})

it('quantile.range() values are arbitrary', () => {
  const a = {}
  const b = {}
  const c = {}
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range([a, b, c, a])
  expect([3, 6, 6.9, 7, 7.1].map(s)).toEqual([a, a, a, a, a])
  expect([8, 8.9].map(s)).toEqual([b, b])
  expect([9, 9.1, 10, 13].map(s)).toEqual([c, c, c, c])
  expect([14.9, 15, 15.1, 16, 20].map(s)).toEqual([a, a, a, a, a])
})

it('quantile.invertExtent() maps a value in the range to a domain extent', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range([0, 1, 2, 3])
  expect(s.invertExtent(0)).toEqual([3, 7.25])
  expect(s.invertExtent(1)).toEqual([7.25, 9])
  expect(s.invertExtent(2)).toEqual([9, 14.5])
  expect(s.invertExtent(3)).toEqual([14.5, 20])
})

it('quantile.invertExtent() allows arbitrary range values', () => {
  const a = {}
  const b = {}
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range([a, b])
  expect(s.invertExtent(a)).toEqual([3, 9])
  expect(s.invertExtent(b)).toEqual([9, 20])
})

it('quantile.invertExtent() returns [NaN, NaN] when the given value is not in the range', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20])
  expect(s.invertExtent(-1).every(isNaN)).toBe(true)
  expect(s.invertExtent(0.5).every(isNaN)).toBe(true)
  expect(s.invertExtent(2).every(isNaN)).toBe(true)
  expect(s.invertExtent('a').every(isNaN)).toBe(true)
})

it('quantile.invertExtent() returns the first match if duplicate values exist in the range', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range([0, 1, 2, 0])
  expect(s.invertExtent(0)).toEqual([3, 7.25])
  expect(s.invertExtent(1)).toEqual([7.25, 9])
  expect(s.invertExtent(2)).toEqual([9, 14.5])
})

it('quantile.unknown(value) sets the return value for undefined, null, and NaN input', () => {
  const s = scaleQuantile().domain([3, 6, 7, 8, 8, 10, 13, 15, 16, 20]).range([0, 1, 2, 3]).unknown(-1)
  expect(s(undefined)).toBe(-1)
  expect(s(null)).toBe(-1)
  expect(s(NaN)).toBe(-1)
  expect(s('N/A')).toBe(-1)
  expect(s(2)).toBe(0)
  expect(s(3)).toBe(0)
  expect(s(21)).toBe(3)
})
