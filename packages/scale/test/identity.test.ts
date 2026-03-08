import { expect, it } from 'bun:test'
import { scaleIdentity } from '../src/index.ts'

it('scaleIdentity() has the expected defaults', () => {
  const s = scaleIdentity()
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([0, 1])
})

it('scaleIdentity(range) sets the domain and range', () => {
  const s = scaleIdentity([1, 2])
  expect(s.domain()).toEqual([1, 2])
  expect(s.range()).toEqual([1, 2])
})

it('identity(x) is the identity function', () => {
  const s = scaleIdentity().domain([1, 2])
  expect(s(0.5)).toBe(0.5)
  expect(s(1)).toBe(1)
  expect(s(1.5)).toBe(1.5)
  expect(s(2)).toBe(2)
  expect(s(2.5)).toBe(2.5)
})

it('identity(x) coerces input to a number', () => {
  const s = scaleIdentity().domain([1, 2])
  expect(s('2')).toBe(2)
})

it('identity(undefined) returns unknown', () => {
  const s = scaleIdentity().unknown(-1)
  expect(s(undefined)).toBe(-1)
  expect(s(null)).toBe(-1)
  expect(s(NaN)).toBe(-1)
  expect(s('N/A')).toBe(-1)
  expect(s(0.4)).toBe(0.4)
})

it('identity.invert(y) is the identity function', () => {
  const s = scaleIdentity().domain([1, 2])
  expect(s.invert(0.5)).toBe(0.5)
  expect(s.invert(1)).toBe(1)
  expect(s.invert(1.5)).toBe(1.5)
  expect(s.invert(2)).toBe(2)
  expect(s.invert(2.5)).toBe(2.5)
})

it('identity.invert(y) coerces range value to numbers', () => {
  const s = scaleIdentity().range(['0', '2'])
  expect(s.invert('1')).toBe(1)
  s.range([new Date(1990, 0, 1), new Date(1991, 0, 1)])
  expect(s.invert(new Date(1990, 6, 2, 13))).toBe(+new Date(1990, 6, 2, 13))
  s.range(['#000', '#fff'])
  expect(isNaN(s.invert('#999'))).toBe(true)
})

it('identity.invert(y) coerces input to a number', () => {
  const s = scaleIdentity().domain([1, 2])
  expect(s.invert('2')).toBe(2)
})

it('identity.domain() is an alias for range()', () => {
  const s = scaleIdentity()
  expect(s.domain).toBe(s.range)
  expect(s.domain()).toEqual(s.range())
  s.domain([-10, 0, 100])
  expect(s.range()).toEqual([-10, 0, 100])
  s.range([-10, 0, 100])
  expect(s.domain()).toEqual([-10, 0, 100])
})

it('identity.domain() defaults to [0, 1]', () => {
  const s = scaleIdentity()
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([0, 1])
  expect(s(0.5)).toBe(0.5)
})

it('identity.domain() coerces values to numbers', () => {
  const s = scaleIdentity().domain([new Date(1990, 0, 1), new Date(1991, 0, 1)])
  expect(typeof s.domain()[0]).toBe('number')
  expect(typeof s.domain()[1]).toBe('number')
  expect(s.domain()[0]).toBe(+new Date(1990, 0, 1))
  expect(s.domain()[1]).toBe(+new Date(1991, 0, 1))
  expect(typeof s(new Date(1989, 9, 20))).toBe('number')
  expect(s(new Date(1989, 9, 20))).toBe(+new Date(1989, 9, 20))
  s.domain(['0', '1'])
  expect(typeof s.domain()[0]).toBe('number')
  expect(typeof s.domain()[1]).toBe('number')
  expect(s(0.5)).toBe(0.5)
  s.domain([new Number(0), new Number(1)])
  expect(typeof s.domain()[0]).toBe('number')
  expect(typeof s.domain()[1]).toBe('number')
  expect(s(0.5)).toBe(0.5)
  s.range([new Date(1990, 0, 1), new Date(1991, 0, 1)])
  expect(typeof s.range()[0]).toBe('number')
  expect(typeof s.range()[1]).toBe('number')
  expect(s.range()[0]).toBe(+new Date(1990, 0, 1))
  expect(s.range()[1]).toBe(+new Date(1991, 0, 1))
  expect(typeof s(new Date(1989, 9, 20))).toBe('number')
  expect(s(new Date(1989, 9, 20))).toBe(+new Date(1989, 9, 20))
  s.range(['0', '1'])
  expect(typeof s.range()[0]).toBe('number')
  expect(typeof s.range()[1]).toBe('number')
  expect(s(0.5)).toBe(0.5)
  s.range([new Number(0), new Number(1)])
  expect(typeof s.range()[0]).toBe('number')
  expect(typeof s.range()[1]).toBe('number')
  expect(s(0.5)).toBe(0.5)
})

it('identity.domain() accepts an iterable', () => {
  const s = scaleIdentity().domain(new Set([1, 2]))
  expect(s.domain()).toEqual([1, 2])
  expect(s.range()).toEqual([1, 2])
})

it('identity.domain() can specify a polyidentity domain and range', () => {
  const s = scaleIdentity().domain([-10, 0, 100])
  expect(s.domain()).toEqual([-10, 0, 100])
  expect(s(-5)).toBe(-5)
  expect(s(50)).toBe(50)
  expect(s(75)).toBe(75)
  s.range([-10, 0, 100])
  expect(s.range()).toEqual([-10, 0, 100])
  expect(s(-5)).toBe(-5)
  expect(s(50)).toBe(50)
  expect(s(75)).toBe(75)
})

it('identity.domain() does not affect the identity function', () => {
  const s = scaleIdentity().domain([Infinity, NaN])
  expect(s(42)).toBe(42)
  expect(s.invert(-42)).toBe(-42)
})

it('identity.ticks(count) generates ticks of varying degree', () => {
  const s = scaleIdentity()
  expect(s.ticks!(1).map(s.tickFormat!(1))).toEqual(['0', '1'])
  expect(s.ticks!(2).map(s.tickFormat!(2))).toEqual(['0.0', '0.5', '1.0'])
  expect(s.ticks!(5).map(s.tickFormat!(5))).toEqual(['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'])
  expect(s.ticks!(10).map(s.tickFormat!(10))).toEqual(['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'])
  s.domain([1, 0])
  expect(s.ticks!(1).map(s.tickFormat!(1))).toEqual(['0', '1'].reverse())
  expect(s.ticks!(2).map(s.tickFormat!(2))).toEqual(['0.0', '0.5', '1.0'].reverse())
  expect(s.ticks!(5).map(s.tickFormat!(5))).toEqual(['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'].reverse())
  expect(s.ticks!(10).map(s.tickFormat!(10))).toEqual(['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'].reverse())
})

it('identity.tickFormat(count) formats ticks with the appropriate precision', () => {
  const s = scaleIdentity().domain([0.123456789, 1.23456789])
  expect(s.tickFormat!(1)(s.ticks!(1)[0])).toBe('1')
  expect(s.tickFormat!(2)(s.ticks!(2)[0])).toBe('0.5')
  expect(s.tickFormat!(4)(s.ticks!(4)[0])).toBe('0.2')
  expect(s.tickFormat!(8)(s.ticks!(8)[0])).toBe('0.2')
  expect(s.tickFormat!(16)(s.ticks!(16)[0])).toBe('0.15')
  expect(s.tickFormat!(32)(s.ticks!(32)[0])).toBe('0.15')
  expect(s.tickFormat!(64)(s.ticks!(64)[0])).toBe('0.14')
  expect(s.tickFormat!(128)(s.ticks!(128)[0])).toBe('0.13')
  expect(s.tickFormat!(256)(s.ticks!(256)[0])).toBe('0.125')
})

it('identity.copy() isolates changes to the domain or range', () => {
  const s1 = scaleIdentity()
  const s2 = s1.copy()
  const s3 = s1.copy()
  s1.domain([1, 2])
  expect(s2.domain()).toEqual([0, 1])
  s2.domain([2, 3])
  expect(s1.domain()).toEqual([1, 2])
  expect(s2.domain()).toEqual([2, 3])
  const s4 = s3.copy()
  s3.range([1, 2])
  expect(s4.range()).toEqual([0, 1])
  s4.range([2, 3])
  expect(s3.range()).toEqual([1, 2])
  expect(s4.range()).toEqual([2, 3])
})
