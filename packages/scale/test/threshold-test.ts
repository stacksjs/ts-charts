import { expect, it } from 'bun:test'
import { scaleThreshold } from '../src/index.ts'

it('scaleThreshold() has the expected defaults', () => {
  const x = scaleThreshold()
  expect(x.domain()).toEqual([0.5])
  expect(x.range()).toEqual([0, 1])
  expect(x(0.50)).toBe(1)
  expect(x(0.49)).toBe(0)
})

it('threshold(x) maps a number to a discrete value in the range', () => {
  const x = scaleThreshold().domain([1/3, 2/3]).range(['a', 'b', 'c'])
  expect(x(0)).toBe('a')
  expect(x(0.2)).toBe('a')
  expect(x(0.4)).toBe('b')
  expect(x(0.6)).toBe('b')
  expect(x(0.8)).toBe('c')
  expect(x(1)).toBe('c')
})

it('threshold(x) returns undefined if the specified value x is not orderable', () => {
  const x = scaleThreshold().domain([1/3, 2/3]).range(['a', 'b', 'c'])
  expect(x()).toBe(undefined)
  expect(x(undefined)).toBe(undefined)
  expect(x(NaN)).toBe(undefined)
  expect(x(null)).toBe(undefined)
})

it('threshold.domain() supports arbitrary orderable values', () => {
  const x = scaleThreshold().domain(['10', '2']).range([0, 1, 2])
  expect(x.domain()[0]).toBe('10')
  expect(x.domain()[1]).toBe('2')
  expect(x('0')).toBe(0)
  expect(x('12')).toBe(1)
  expect(x('3')).toBe(2)
})

it('threshold.domain() accepts an iterable', () => {
  const x = scaleThreshold().domain(new Set(['10', '2'])).range([0, 1, 2])
  expect(x.domain()).toEqual(['10', '2'])
})

it('threshold.range() supports arbitrary values', () => {
  const a = {}, b = {}, c = {}, x = scaleThreshold().domain([1/3, 2/3]).range([a, b, c])
  expect(x(0)).toBe(a)
  expect(x(0.2)).toBe(a)
  expect(x(0.4)).toBe(b)
  expect(x(0.6)).toBe(b)
  expect(x(0.8)).toBe(c)
  expect(x(1)).toBe(c)
})

it('threshold.range() accepts an iterable', () => {
  const x = scaleThreshold().domain(['10', '2']).range(new Set([0, 1, 2]))
  expect(x.range()).toEqual([0, 1, 2])
})

it('threshold.invertExtent(y) returns the domain extent for the specified range value', () => {
  const a = {}, b = {}, c = {}, x = scaleThreshold().domain([1/3, 2/3]).range([a, b, c])
  expect(x.invertExtent(a)).toEqual([undefined, 1/3])
  expect(x.invertExtent(b)).toEqual([1/3, 2/3])
  expect(x.invertExtent(c)).toEqual([2/3, undefined])
  expect(x.invertExtent({})).toEqual([undefined, undefined])
})
