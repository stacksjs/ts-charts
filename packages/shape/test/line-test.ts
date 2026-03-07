import { describe, it, expect } from 'bun:test'
import { line, curveLinear, curveLinearClosed } from '../src/index.ts'
import { assertPathEqual } from './asserts.ts'

it('line() returns a default line shape', () => {
  const l = line()
  expect(l.x()([42, 34])).toBe(42)
  expect(l.y()([42, 34])).toBe(34)
  expect(l.defined()([42, 34])).toBe(true)
  expect(l.curve()).toBe(curveLinear)
  expect(l.context()).toBeNull()
  assertPathEqual(l([[0, 1], [2, 3], [4, 5]]), 'M0,1L2,3L4,5')
})

it('line(x, y) sets x and y', () => {
  const x = function () {}, y = function () {}
  expect(line(x).x()).toBe(x)
  expect(line(x, y).y()).toBe(y)
  expect(line(3, 2).x()('aa')).toBe(3)
  expect(line(3, 2).y()('aa')).toBe(2)
})

it('line.x(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  line().x(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('line.y(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  line().y(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('line.defined(f)(data) passes d, i and data to the specified function f', () => {
  const data = ['a', 'b'], actual: any[] = []
  line().defined(function () { actual.push([].slice.call(arguments)) })(data)
  expect(actual).toEqual([['a', 0, data], ['b', 1, data]])
})

it('line.x(x)(data) observes the specified function', () => {
  const l = line().x(function (d: any) { return d.x })
  assertPathEqual(l([{ x: 0, 1: 1 }, { x: 2, 1: 3 }, { x: 4, 1: 5 }]), 'M0,1L2,3L4,5')
})

it('line.x(x)(data) observes the specified constant', () => {
  const l = line().x(0)
  assertPathEqual(l([{ 1: 1 }, { 1: 3 }, { 1: 5 }]), 'M0,1L0,3L0,5')
})

it('line.y(y)(data) observes the specified function', () => {
  const l = line().y(function (d: any) { return d.y })
  assertPathEqual(l([{ 0: 0, y: 1 }, { 0: 2, y: 3 }, { 0: 4, y: 5 }]), 'M0,1L2,3L4,5')
})

it('line.y(y)(data) observes the specified constant', () => {
  const l = line().y(0)
  assertPathEqual(l([{ 0: 0 }, { 0: 2 }, { 0: 4 }]), 'M0,0L2,0L4,0')
})

it('line.curve(curve) sets the curve method', () => {
  const l = line().curve(curveLinearClosed)
  expect(l([])).toBeNull()
  assertPathEqual(l([[0, 1], [2, 3]]), 'M0,1L2,3Z')
})

it('line.digits(digits) sets the maximum fractional digits', () => {
  const points = [[0, Math.PI], [Math.E, 4]]
  const l = line()
  expect(l.digits()).toBe(3)
  expect(l(points)).toBe('M0,3.142L2.718,4')
  expect(l.digits(6)).toBe(l)
  expect(l.digits()).toBe(6)
  expect(l(points)).toBe('M0,3.141593L2.718282,4')
  expect(line()(points)).toBe('M0,3.142L2.718,4')
  expect(l.digits(null)).toBe(l)
  expect(l.digits()).toBeNull()
  expect(l(points)).toBe('M0,3.141592653589793L2.718281828459045,4')
  expect(line()(points)).toBe('M0,3.142L2.718,4')
  expect(l.digits(3)).toBe(l)
  expect(l.digits()).toBe(3)
  expect(l(points)).toBe('M0,3.142L2.718,4')
})
