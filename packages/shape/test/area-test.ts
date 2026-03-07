import { describe, it, expect } from 'bun:test'
import { area, curveCardinal, curveLinear } from '../src/index.ts'
import { assertPathEqual } from './asserts.ts'

it('area() returns a default area shape', () => {
  const a = area()
  expect(a.x0()([42, 34])).toBe(42)
  expect(a.x1()).toBeNull()
  expect(a.y0()([42, 34])).toBe(0)
  expect(a.y1()([42, 34])).toBe(34)
  expect(a.defined()([42, 34])).toBe(true)
  expect(a.curve()).toBe(curveLinear)
  expect(a.context()).toBeNull()
  assertPathEqual(a([[0, 1], [2, 3], [4, 5]]), 'M0,1L2,3L4,5L4,0L2,0L0,0Z')
})

it('area(x, y0, y1) sets x0, y0 and y1', () => {
  const x = function () {}, y = function () {}
  expect(area(x).x0()).toBe(x)
  expect(area(x, y).y0()).toBe(y)
  expect(area(x, 0, y).y1()).toBe(y)
  expect(area(3, 2, 1).x0()('aa')).toBe(3)
  expect(area(3, 2, 1).y0()('aa')).toBe(2)
  expect(area(3, 2, 1).y1()('aa')).toBe(1)
})

it('area.x(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  area().x(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('area.x0(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  area().x0(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('area.x1(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  area().x1(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('area.y(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  area().y(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('area.y0(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  area().y0(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('area.y1(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  area().y1(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('area.defined(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  area().defined(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('area.x(x)(data) observes the specified function', () => {
  const x = function (d: any) { return d.x }
  const a = area().x(x)
  expect(a.x()).toBe(x)
  expect(a.x0()).toBe(x)
  expect(a.x1()).toBeNull()
  assertPathEqual(a([{ x: 0, 1: 1 }, { x: 2, 1: 3 }, { x: 4, 1: 5 }]), 'M0,1L2,3L4,5L4,0L2,0L0,0Z')
})

it('area.x(x)(data) observes the specified constant', () => {
  const a = area().x(0)
  expect(a.x()()).toBe(0)
  expect(a.x0()()).toBe(0)
  expect(a.x1()).toBeNull()
  assertPathEqual(a([{ 1: 1 }, { 1: 3 }, { 1: 5 }]), 'M0,1L0,3L0,5L0,0L0,0L0,0Z')
})

it('area.y(y)(data) observes the specified function', () => {
  const y = function (d: any) { return d.y }
  const a = area().y(y)
  expect(a.y()).toBe(y)
  expect(a.y0()).toBe(y)
  expect(a.y1()).toBeNull()
  assertPathEqual(a([{ 0: 0, y: 1 }, { 0: 2, y: 3 }, { 0: 4, y: 5 }]), 'M0,1L2,3L4,5L4,5L2,3L0,1Z')
})

it('area.y(y)(data) observes the specified constant', () => {
  const a = area().y(0)
  expect(a.y()()).toBe(0)
  expect(a.y0()()).toBe(0)
  expect(a.y1()).toBeNull()
  assertPathEqual(a([{ 0: 0 }, { 0: 2 }, { 0: 4 }]), 'M0,0L2,0L4,0L4,0L2,0L0,0Z')
})

it('area.curve(curve) sets the curve method', () => {
  const a = area().curve(curveCardinal)
  assertPathEqual(a([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M0,1C0,1,0.666667,3,1,3C1.333333,3,1.666667,1,2,1C2.333333,1,3,3,3,3L3,0C3,0,2.333333,0,2,0C1.666667,0,1.333333,0,1,0C0.666667,0,0,0,0,0Z')
})

it('area.lineX0() returns a line derived from the area', () => {
  const defined = function () { return true }
  const curve = curveCardinal
  const context = {}
  const x0 = function () {}
  const x1 = function () {}
  const y = function () {}
  const a = area().defined(defined).curve(curve).context(context).y(y).x0(x0).x1(x1)
  const l = a.lineX0()
  expect(l.defined()).toBe(defined)
  expect(l.curve()).toBe(curve)
  expect(l.context()).toBe(context)
  expect(l.x()).toBe(x0)
  expect(l.y()).toBe(y)
})

it('area.lineY1() returns a line derived from the area', () => {
  const defined = function () { return true }
  const curve = curveCardinal
  const context = {}
  const x = function () {}
  const y0 = function () {}
  const y1 = function () {}
  const a = area().defined(defined).curve(curve).context(context).x(x).y0(y0).y1(y1)
  const l = a.lineY1()
  expect(l.defined()).toBe(defined)
  expect(l.curve()).toBe(curve)
  expect(l.context()).toBe(context)
  expect(l.x()).toBe(x)
  expect(l.y()).toBe(y1)
})
