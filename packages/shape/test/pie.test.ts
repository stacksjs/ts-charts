/* eslint-disable no-loss-of-precision */
import { describe, it, expect } from 'bun:test'
import { pie } from '../src/index.ts'

it('pie() returns a default pie shape', () => {
  const p = pie()
  expect(p.value()(42)).toBe(42)
  expect(p.sortValues()(1, 2)).toBeGreaterThan(0)
  expect(p.sortValues()(2, 1)).toBeLessThan(0)
  expect(p.sortValues()(1, 1)).toBe(0)
  expect(p.sort()).toBeNull()
  expect(p.startAngle()()).toBe(0)
  expect(p.endAngle()()).toBe(2 * Math.PI)
  expect(p.padAngle()()).toBe(0)
})

it('pie(data) returns arcs in input order', () => {
  const p = pie()
  expect(p([1, 3, 2])).toEqual([
    { data: 1, value: 1, index: 2, startAngle: 5.235987755982988, endAngle: 6.283185307179585, padAngle: 0 },
    { data: 3, value: 3, index: 0, startAngle: 0.000000000000000, endAngle: 3.141592653589793, padAngle: 0 },
    { data: 2, value: 2, index: 1, startAngle: 3.141592653589793, endAngle: 5.235987755982988, padAngle: 0 },
  ])
})

it('pie(data) accepts an iterable', () => {
  const p = pie()
  expect(p(new Set([1, 3, 2]))).toEqual([
    { data: 1, value: 1, index: 2, startAngle: 5.235987755982988, endAngle: 6.283185307179585, padAngle: 0 },
    { data: 3, value: 3, index: 0, startAngle: 0.000000000000000, endAngle: 3.141592653589793, padAngle: 0 },
    { data: 2, value: 2, index: 1, startAngle: 3.141592653589793, endAngle: 5.235987755982988, padAngle: 0 },
  ])
})

it('pie(data) treats negative values as zero', () => {
  const p = pie()
  expect(p([1, 0, -1])).toEqual([
    { data: 1, value: 1, index: 0, startAngle: 0.000000000000000, endAngle: 6.283185307179586, padAngle: 0 },
    { data: 0, value: 0, index: 1, startAngle: 6.283185307179586, endAngle: 6.283185307179586, padAngle: 0 },
    { data: -1, value: -1, index: 2, startAngle: 6.283185307179586, endAngle: 6.283185307179586, padAngle: 0 },
  ])
})

it('pie(data) puts everything at the startAngle when the sum is zero', () => {
  const p = pie()
  expect(p([0, 0])).toEqual([
    { data: 0, value: 0, index: 0, startAngle: 0, endAngle: 0, padAngle: 0 },
    { data: 0, value: 0, index: 1, startAngle: 0, endAngle: 0, padAngle: 0 },
  ])
})

it('pie.value(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b']
  const actual: any[] = []
  pie().value(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('pie().startAngle(f)(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  pie().startAngle(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('pie().startAngle(t)(data) observes the specified start angle', () => {
  expect(pie().startAngle(Math.PI)([1, 2, 3])).toEqual([
    { data: 1, value: 1, index: 2, startAngle: 5.759586531581287, endAngle: 6.283185307179586, padAngle: 0 },
    { data: 2, value: 2, index: 1, startAngle: 4.712388980384690, endAngle: 5.759586531581287, padAngle: 0 },
    { data: 3, value: 3, index: 0, startAngle: 3.141592653589793, endAngle: 4.712388980384690, padAngle: 0 },
  ])
})

it('pie().endAngle(t)(data) observes the specified end angle', () => {
  expect(pie().endAngle(Math.PI)([1, 2, 3])).toEqual([
    { data: 1, value: 1, index: 2, startAngle: 2.6179938779914940, endAngle: 3.1415926535897927, padAngle: 0 },
    { data: 2, value: 2, index: 1, startAngle: 1.5707963267948966, endAngle: 2.6179938779914940, padAngle: 0 },
    { data: 3, value: 3, index: 0, startAngle: 0.0000000000000000, endAngle: 1.5707963267948966, padAngle: 0 },
  ])
})

it('pie().padAngle(d)(data) observes the specified pad angle', () => {
  expect(pie().padAngle(0.1)([1, 2, 3])).toEqual([
    { data: 1, value: 1, index: 2, startAngle: 5.1859877559829880, endAngle: 6.2831853071795850, padAngle: 0.1 },
    { data: 2, value: 2, index: 1, startAngle: 3.0915926535897933, endAngle: 5.1859877559829880, padAngle: 0.1 },
    { data: 3, value: 3, index: 0, startAngle: 0.0000000000000000, endAngle: 3.0915926535897933, padAngle: 0.1 },
  ])
})

it('pie.sortValues(f) sorts arcs by value per the specified comparator function f', () => {
  const p = pie()
  expect(p.sortValues(function (a: number, b: number) { return a - b })([1, 3, 2])).toEqual([
    { data: 1, value: 1, index: 0, startAngle: 0.0000000000000000, endAngle: 1.0471975511965976, padAngle: 0 },
    { data: 3, value: 3, index: 2, startAngle: 3.1415926535897930, endAngle: 6.2831853071795860, padAngle: 0 },
    { data: 2, value: 2, index: 1, startAngle: 1.0471975511965976, endAngle: 3.1415926535897930, padAngle: 0 },
  ])
  expect(p.sort()).toBeNull()
})
