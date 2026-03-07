import { expect, it } from 'bun:test'
import { scaleImplicit, scaleOrdinal } from '../src/index.ts'

it('scaleOrdinal() has the expected defaults', () => {
  const s = scaleOrdinal()
  expect(s.domain()).toEqual([])
  expect(s.range()).toEqual([])
  expect(s(0)).toBe(undefined)
  expect(s.unknown()).toBe(scaleImplicit)
  expect(s.domain()).toEqual([0])
})

it('ordinal(x) maps a unique name x in the domain to the corresponding value y in the range', () => {
  const s = scaleOrdinal().domain([0, 1]).range(['foo', 'bar']).unknown(undefined)
  expect(s(0)).toBe('foo')
  expect(s(1)).toBe('bar')
  s.range(['a', 'b', 'c'])
  expect(s(0)).toBe('a')
  expect(s('0')).toBe(undefined)
  expect(s([0])).toBe(undefined)
  expect(s(1)).toBe('b')
  expect(s(new Number(1))).toBe('b')
  expect(s(2)).toBe(undefined)
})

it('ordinal(x) implicitly extends the domain when a range is explicitly specified', () => {
  const s = scaleOrdinal().range(['foo', 'bar'])
  expect(s.domain()).toEqual([])
  expect(s(0)).toBe('foo')
  expect(s.domain()).toEqual([0])
  expect(s(1)).toBe('bar')
  expect(s.domain()).toEqual([0, 1])
  expect(s(0)).toBe('foo')
  expect(s.domain()).toEqual([0, 1])
})

it('ordinal.domain(x) makes a copy of the domain', () => {
  const domain = ['red', 'green']
  const s = scaleOrdinal().domain(domain)
  domain.push('blue')
  expect(s.domain()).toEqual(['red', 'green'])
})

it('ordinal.domain() returns a copy of the domain', () => {
  const s = scaleOrdinal().domain(['red', 'green'])
  const domain = s.domain()
  s('blue')
  expect(domain).toEqual(['red', 'green'])
})

it('ordinal.domain() accepts an iterable', () => {
  const s = scaleOrdinal().domain(new Set(['red', 'green']))
  expect(s.domain()).toEqual(['red', 'green'])
})

it('ordinal.domain() replaces previous domain values', () => {
  const s = scaleOrdinal().range(['foo', 'bar'])
  expect(s(1)).toBe('foo')
  expect(s(0)).toBe('bar')
  expect(s.domain()).toEqual([1, 0])
  s.domain(['0', '1'])
  expect(s('0')).toBe('foo')
  expect(s('1')).toBe('bar')
  expect(s.domain()).toEqual(['0', '1'])
})

it('ordinal.domain() uniqueness is based on primitive coercion', () => {
  const s = scaleOrdinal().domain(['foo']).range([42, 43, 44])
  expect(s(new String('foo'))).toBe(42)
  expect(s({valueOf: function() { return 'foo' }})).toBe(42)
  expect(s({valueOf: function() { return 'bar' }})).toBe(43)
})

it('ordinal.domain() does not coerce domain values to strings', () => {
  const s = scaleOrdinal().domain([0, 1])
  expect(s.domain()).toEqual([0, 1])
  expect(typeof s.domain()[0]).toBe('number')
  expect(typeof s.domain()[1]).toBe('number')
})

it('ordinal.domain() does not barf on object built-ins', () => {
  const s = scaleOrdinal().domain(['__proto__', 'hasOwnProperty']).range([42, 43])
  expect(s('__proto__')).toBe(42)
  expect(s('hasOwnProperty')).toBe(43)
  expect(s.domain()).toEqual(['__proto__', 'hasOwnProperty'])
})

it('ordinal() accepts dates', () => {
  const s = scaleOrdinal()
  s(new Date(1970, 2, 1))
  s(new Date(2001, 4, 13))
  s(new Date(1970, 2, 1))
  s(new Date(2001, 4, 13))
  expect(s.domain()).toEqual([new Date(1970, 2, 1), new Date(2001, 4, 13)])
})

it('ordinal.domain() accepts dates', () => {
  const s = scaleOrdinal().domain([
    new Date(1970, 2, 1),
    new Date(2001, 4, 13),
    new Date(1970, 2, 1),
    new Date(2001, 4, 13)
  ])
  s(new Date(1970, 2, 1))
  s(new Date(1999, 11, 31))
  expect(s.domain()).toEqual([new Date(1970, 2, 1), new Date(2001, 4, 13), new Date(1999, 11, 31)])
})

it('ordinal.domain() is ordered by appearance', () => {
  const s = scaleOrdinal()
  s('foo')
  s('bar')
  s('baz')
  expect(s.domain()).toEqual(['foo', 'bar', 'baz'])
  s.domain(['baz', 'bar'])
  s('foo')
  expect(s.domain()).toEqual(['baz', 'bar', 'foo'])
  s.domain(['baz', 'foo'])
  expect(s.domain()).toEqual(['baz', 'foo'])
  s.domain([])
  s('foo')
  s('bar')
  expect(s.domain()).toEqual(['foo', 'bar'])
})

it('ordinal.range(x) makes a copy of the range', () => {
  const range = ['red', 'green']
  const s = scaleOrdinal().range(range)
  range.push('blue')
  expect(s.range()).toEqual(['red', 'green'])
})

it('ordinal.range() accepts an iterable', () => {
  const s = scaleOrdinal().range(new Set(['red', 'green']))
  expect(s.range()).toEqual(['red', 'green'])
})

it('ordinal.range() returns a copy of the range', () => {
  const s = scaleOrdinal().range(['red', 'green'])
  const range = s.range()
  expect(range).toEqual(['red', 'green'])
  range.push('blue')
  expect(s.range()).toEqual(['red', 'green'])
})

it('ordinal.range(values) does not discard implicit domain associations', () => {
  const s = scaleOrdinal()
  expect(s(0)).toBe(undefined)
  expect(s(1)).toBe(undefined)
  s.range(['foo', 'bar'])
  expect(s(1)).toBe('bar')
  expect(s(0)).toBe('foo')
})

it('ordinal(value) recycles values when exhausted', () => {
  const s = scaleOrdinal().range(['a', 'b', 'c'])
  expect(s(0)).toBe('a')
  expect(s(1)).toBe('b')
  expect(s(2)).toBe('c')
  expect(s(3)).toBe('a')
  expect(s(4)).toBe('b')
  expect(s(5)).toBe('c')
  expect(s(2)).toBe('c')
  expect(s(1)).toBe('b')
  expect(s(0)).toBe('a')
})

it('ordinal.unknown(x) sets the output value for unknown inputs', () => {
  const s = scaleOrdinal().domain(['foo', 'bar']).unknown('gray').range(['red', 'blue'])
  expect(s('foo')).toBe('red')
  expect(s('bar')).toBe('blue')
  expect(s('baz')).toBe('gray')
  expect(s('quux')).toBe('gray')
})

it('ordinal.unknown(x) prevents implicit domain extension if x is not implicit', () => {
  const s = scaleOrdinal().domain(['foo', 'bar']).unknown(undefined).range(['red', 'blue'])
  expect(s('baz')).toBe(undefined)
  expect(s.domain()).toEqual(['foo', 'bar'])
})

it('ordinal.copy() copies all fields', () => {
  const s1 = scaleOrdinal().domain([1, 2]).range(['red', 'green']).unknown('gray')
  const s2 = s1.copy()
  expect(s2.domain()).toEqual(s1.domain())
  expect(s2.range()).toEqual(s1.range())
  expect(s2.unknown()).toEqual(s1.unknown())
})

it('ordinal.copy() changes to the domain are isolated', () => {
  const s1 = scaleOrdinal().range(['foo', 'bar'])
  const s2 = s1.copy()
  s1.domain([1, 2])
  expect(s2.domain()).toEqual([])
  expect(s1(1)).toBe('foo')
  expect(s2(1)).toBe('foo')
  s2.domain([2, 3])
  expect(s1(2)).toBe('bar')
  expect(s2(2)).toBe('foo')
  expect(s1.domain()).toEqual([1, 2])
  expect(s2.domain()).toEqual([2, 3])
})

it('ordinal.copy() changes to the range are isolated', () => {
  const s1 = scaleOrdinal().range(['foo', 'bar'])
  const s2 = s1.copy()
  s1.range(['bar', 'foo'])
  expect(s1(1)).toBe('bar')
  expect(s2(1)).toBe('foo')
  expect(s2.range()).toEqual(['foo', 'bar'])
  s2.range(['foo', 'baz'])
  expect(s1(2)).toBe('foo')
  expect(s2(2)).toBe('baz')
  expect(s1.range()).toEqual(['bar', 'foo'])
  expect(s2.range()).toEqual(['foo', 'baz'])
})
