import { describe, it, expect } from 'bun:test'
import { scaleBand } from '../src/index.ts'

describe('scaleBand', () => {
  it('scaleBand() has the expected defaults', () => {
    const s = scaleBand()
    expect(s.domain()).toEqual([])
    expect(s.range()).toEqual([0, 1])
    expect(s.bandwidth()).toBe(1)
    expect(s.step()).toBe(1)
    expect(s.round()).toBe(false)
    expect(s.paddingInner()).toBe(0)
    expect(s.paddingOuter()).toBe(0)
    expect(s.align()).toBe(0.5)
  })

  it('band(value) computes discrete bands in a continuous range', () => {
    const s = scaleBand([0, 960])
    expect(s('foo')).toBe(undefined)
    s.domain(['foo', 'bar'])
    expect(s('foo')).toBe(0)
    expect(s('bar')).toBe(480)
    s.domain(['a', 'b', 'c']).range([0, 120])
    expect(s.domain().map(s)).toEqual([0, 40, 80])
    expect(s.bandwidth()).toBe(40)
    s.padding(0.2)
    expect(s.domain().map(s)).toEqual([7.5, 45, 82.5])
    expect(s.bandwidth()).toBe(30)
  })

  it('band(value) returns undefined for values outside the domain', () => {
    const s = scaleBand(['a', 'b', 'c'], [0, 1])
    expect(s('d')).toBe(undefined)
    expect(s('e')).toBe(undefined)
    expect(s('f')).toBe(undefined)
  })

  it('band(value) does not implicitly add values to the domain', () => {
    const s = scaleBand(['a', 'b', 'c'], [0, 1])
    s('d')
    s('e')
    expect(s.domain()).toEqual(['a', 'b', 'c'])
  })

  it('band.step() returns the distance between the starts of adjacent bands', () => {
    const s = scaleBand([0, 960])
    expect(s.domain(['foo']).step()).toBe(960)
    expect(s.domain(['foo', 'bar']).step()).toBe(480)
    expect(s.domain(['foo', 'bar', 'baz']).step()).toBe(320)
    s.padding(0.5)
    expect(s.domain(['foo']).step()).toBe(640)
    expect(s.domain(['foo', 'bar']).step()).toBe(384)
  })

  it('band.bandwidth() returns the width of the band', () => {
    const s = scaleBand([0, 960])
    expect(s.domain([]).bandwidth()).toBe(960)
    expect(s.domain(['foo']).bandwidth()).toBe(960)
    expect(s.domain(['foo', 'bar']).bandwidth()).toBe(480)
    expect(s.domain(['foo', 'bar', 'baz']).bandwidth()).toBe(320)
    s.padding(0.5)
    expect(s.domain([]).bandwidth()).toBe(480)
    expect(s.domain(['foo']).bandwidth()).toBe(320)
    expect(s.domain(['foo', 'bar']).bandwidth()).toBe(192)
  })

  it('band.domain([]) computes reasonable band and step values', () => {
    const s = scaleBand([0, 960]).domain([])
    expect(s.step()).toBe(960)
    expect(s.bandwidth()).toBe(960)
    s.padding(0.5)
    expect(s.step()).toBe(960)
    expect(s.bandwidth()).toBe(480)
    s.padding(1)
    expect(s.step()).toBe(960)
    expect(s.bandwidth()).toBe(0)
  })

  it('band.domain([value]) computes a reasonable singleton band, even with padding', () => {
    const s = scaleBand([0, 960]).domain(['foo'])
    expect(s('foo')).toBe(0)
    expect(s.step()).toBe(960)
    expect(s.bandwidth()).toBe(960)
    s.padding(0.5)
    expect(s('foo')).toBe(320)
    expect(s.step()).toBe(640)
    expect(s.bandwidth()).toBe(320)
    s.padding(1)
    expect(s('foo')).toBe(480)
    expect(s.step()).toBe(480)
    expect(s.bandwidth()).toBe(0)
  })

  it('band.domain(values) recomputes the bands', () => {
    const s = scaleBand().domain(['a', 'b', 'c']).rangeRound([0, 100])
    expect(s.domain().map(s)).toEqual([1, 34, 67])
    expect(s.bandwidth()).toBe(33)
    s.domain(['a', 'b', 'c', 'd'])
    expect(s.domain().map(s)).toEqual([0, 25, 50, 75])
    expect(s.bandwidth()).toBe(25)
  })

  it('band.domain(domain) accepts an iterable', () => {
    expect(scaleBand().domain(new Set(['a', 'b', 'c'])).domain()).toEqual(['a', 'b', 'c'])
  })

  it('band.domain(values) makes a copy of the specified domain values', () => {
    const domain = ['red', 'green']
    const s = scaleBand().domain(domain)
    domain.push('blue')
    expect(s.domain()).toEqual(['red', 'green'])
  })

  it('band.domain() returns a copy of the domain', () => {
    const s = scaleBand().domain(['red', 'green'])
    const domain = s.domain()
    expect(domain).toEqual(['red', 'green'])
    domain.push('blue')
    expect(s.domain()).toEqual(['red', 'green'])
  })

  it('band.range(values) can be descending', () => {
    const s = scaleBand().domain(['a', 'b', 'c']).range([120, 0])
    expect(s.domain().map(s)).toEqual([80, 40, 0])
    expect(s.bandwidth()).toBe(40)
    s.padding(0.2)
    expect(s.domain().map(s)).toEqual([82.5, 45, 7.5])
    expect(s.bandwidth()).toBe(30)
  })

  it('band.range(values) makes a copy of the specified range values', () => {
    const range = [1, 2]
    const s = scaleBand().range(range)
    range.push('blue' as any)
    expect(s.range()).toEqual([1, 2])
  })

  it('band.range() returns a copy of the range', () => {
    const s = scaleBand().range([1, 2])
    const range = s.range()
    expect(range).toEqual([1, 2])
    range.push('blue' as any)
    expect(s.range()).toEqual([1, 2])
  })

  it('band.range(values) accepts an iterable', () => {
    const s = scaleBand().range(new Set([1, 2]))
    expect(s.range()).toEqual([1, 2])
  })

  it('band.rangeRound(values) accepts an iterable', () => {
    const s = scaleBand().rangeRound(new Set([1, 2]))
    expect(s.range()).toEqual([1, 2])
  })

  it('band.range(values) coerces values to numbers', () => {
    const s = scaleBand().range(['1.0', '2.0'] as any)
    expect(s.range()).toEqual([1, 2])
  })

  it('band.rangeRound(values) coerces values to numbers', () => {
    const s = scaleBand().rangeRound(['1.0', '2.0'] as any)
    expect(s.range()).toEqual([1, 2])
  })

  it('band.paddingInner(p) specifies the inner padding p', () => {
    const s = scaleBand().domain(['a', 'b', 'c']).range([120, 0]).paddingInner(0.1).round(true)
    expect(s.domain().map(s)).toEqual([83, 42, 1])
    expect(s.bandwidth()).toBe(37)
    s.paddingInner(0.2)
    expect(s.domain().map(s)).toEqual([85, 43, 1])
    expect(s.bandwidth()).toBe(34)
  })

  it('band.paddingInner(p) coerces p to a number <= 1', () => {
    const s = scaleBand()
    expect(s.paddingInner('1.0' as any).paddingInner()).toBe(1)
    expect(s.paddingInner('-1.0' as any).paddingInner()).toBe(-1)
    expect(s.paddingInner('2.0' as any).paddingInner()).toBe(1)
    expect(Number.isNaN(s.paddingInner(NaN).paddingInner())).toBe(true)
  })

  it('band.paddingOuter(p) specifies the outer padding p', () => {
    const s = scaleBand().domain(['a', 'b', 'c']).range([120, 0]).paddingInner(0.2).paddingOuter(0.1)
    expect(s.domain().map(s)).toEqual([84, 44, 4])
    expect(s.bandwidth()).toBe(32)
    s.paddingOuter(1)
    expect(s.domain().map(s)).toEqual([75, 50, 25])
    expect(s.bandwidth()).toBe(20)
  })

  it('band.paddingOuter(p) coerces p to a number', () => {
    const s = scaleBand()
    expect(s.paddingOuter('1.0' as any).paddingOuter()).toBe(1)
    expect(s.paddingOuter('-1.0' as any).paddingOuter()).toBe(-1)
    expect(s.paddingOuter('2.0' as any).paddingOuter()).toBe(2)
    expect(Number.isNaN(s.paddingOuter(NaN).paddingOuter())).toBe(true)
  })

  it('band.rangeRound(values) is an alias for band.range(values).round(true)', () => {
    const s = scaleBand().domain(['a', 'b', 'c']).rangeRound([0, 100])
    expect(s.range()).toEqual([0, 100])
    expect(s.round()).toBe(true)
  })

  it('band.round(true) computes discrete rounded bands in a continuous range', () => {
    const s = scaleBand().domain(['a', 'b', 'c']).range([0, 100]).round(true)
    expect(s.domain().map(s)).toEqual([1, 34, 67])
    expect(s.bandwidth()).toBe(33)
    s.padding(0.2)
    expect(s.domain().map(s)).toEqual([7, 38, 69])
    expect(s.bandwidth()).toBe(25)
  })

  it('band.copy() copies all fields', () => {
    const s1 = scaleBand().domain(['red', 'green']).range([1, 2]).round(true).paddingInner(0.1).paddingOuter(0.2)
    const s2 = s1.copy()
    expect(s2.domain()).toEqual(s1.domain())
    expect(s2.range()).toEqual(s1.range())
    expect(s2.round()).toBe(s1.round())
    expect(s2.paddingInner()).toBe(s1.paddingInner())
    expect(s2.paddingOuter()).toBe(s1.paddingOuter())
  })

  it('band.copy() isolates changes to the domain', () => {
    const s1 = scaleBand().domain(['foo', 'bar']).range([0, 2])
    const s2 = s1.copy()
    s1.domain(['red', 'blue'])
    expect(s2.domain()).toEqual(['foo', 'bar'])
    expect(s1.domain().map(s1)).toEqual([0, 1])
    expect(s2.domain().map(s2)).toEqual([0, 1])
    s2.domain(['red', 'blue'])
    expect(s1.domain()).toEqual(['red', 'blue'])
    expect(s1.domain().map(s1)).toEqual([0, 1])
    expect(s2.domain().map(s2)).toEqual([0, 1])
  })

  it('band.copy() isolates changes to the range', () => {
    const s1 = scaleBand().domain(['foo', 'bar']).range([0, 2])
    const s2 = s1.copy()
    s1.range([3, 5])
    expect(s2.range()).toEqual([0, 2])
    expect(s1.domain().map(s1)).toEqual([3, 4])
    expect(s2.domain().map(s2)).toEqual([0, 1])
    s2.range([5, 7])
    expect(s1.range()).toEqual([3, 5])
    expect(s1.domain().map(s1)).toEqual([3, 4])
    expect(s2.domain().map(s2)).toEqual([5, 6])
  })
})
