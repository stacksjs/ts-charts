import { describe, it, expect } from 'bun:test'
import { stack, stackOffsetExpand, stackOffsetNone, stackOrderNone, stackOrderReverse } from '../src/index.ts'

it('stack() has the expected defaults', () => {
  const s = stack()
  expect(s.keys()()).toEqual([])
  expect(s.value()({ foo: 42 }, 'foo')).toBe(42)
  expect(s.order()).toBe(stackOrderNone)
  expect(s.offset()).toBe(stackOffsetNone)
})

it('stack(data) computes the stacked series for the given data', () => {
  const s = stack().keys([0, 1, 2, 3])
  const data = [[1, 3, 5, 1], [2, 4, 2, 3], [1, 2, 4, 2]]
  expect(s(data)).toEqual([
    series([[0, 1], [0, 2], [0, 1]], data, 0, 0),
    series([[1, 4], [2, 6], [1, 3]], data, 1, 1),
    series([[4, 9], [6, 8], [3, 7]], data, 2, 2),
    series([[9, 10], [8, 11], [7, 9]], data, 3, 3),
  ])
})

it('stack.keys(array) sets the array of constant keys', () => {
  const s = stack().keys(['0.0', '2.0', '4.0'])
  expect(s.keys()()).toEqual(['0.0', '2.0', '4.0'])
})

it('stack.keys(function) sets the key accessor function', () => {
  const s = stack().keys(function () { return 'abc'.split('') })
  expect(s.keys()()).toEqual(['a', 'b', 'c'])
})

it('stack(data, arguments...) passes the key accessor any additional arguments', () => {
  let A: any
  let B: any
  const k = function (data: any, a: any, b: any) { A = a; B = b; return Object.keys(data[0]) }
  const s = stack().keys(k)
  const data = [[1, 3, 5, 1], [2, 4, 2, 3], [1, 2, 4, 2]]
  expect(s(data, 'foo', 'bar')).toEqual([
    series([[0, 1], [0, 2], [0, 1]], data, '0', 0),
    series([[1, 4], [2, 6], [1, 3]], data, '1', 1),
    series([[4, 9], [6, 8], [3, 7]], data, '2', 2),
    series([[9, 10], [8, 11], [7, 9]], data, '3', 3),
  ])
  expect(A).toBe('foo')
  expect(B).toBe('bar')
})

it('stack.value(number) sets the constant value', () => {
  const s = stack().value('42.0' as any)
  expect(s.value()()).toBe(42)
})

it('stack.value(function) sets the value accessor function', () => {
  const v = function () { return 42 }
  const s = stack().value(v)
  expect(s.value()).toBe(v)
})

it('stack(data) passes the value accessor datum, key, index and data', () => {
  let actual: any
  const v = function (d: any, k: any, i: any, data: any) { actual = { datum: d, key: k, index: i, data: data }; return 2 }
  const s = stack().keys(['foo']).value(v)
  const data = [{ foo: 1 }]
  expect(s(data)).toEqual([series([[0, 2]], data, 'foo', 0)])
  expect(actual).toEqual({ datum: data[0], key: 'foo', index: 0, data: data })
})

it('stack(data) coerces the return value of the value accessor to a number', () => {
  const v = function () { return '2.0' }
  const s = stack().keys(['foo']).value(v)
  const data = [{ foo: 1 }]
  expect(s(data)).toEqual([series([[0, 2]], data, 'foo', 0)])
})

it('stack.order(null) is equivalent to stack.order(stackOrderNone)', () => {
  const s = stack().order(null)
  expect(s.order()).toBe(stackOrderNone)
  expect(typeof s.order()).toBe('function')
})

it('stack.order(function) sets the order function', () => {
  const s = stack().keys([0, 1, 2, 3]).order(stackOrderReverse)
  const data = [[1, 3, 5, 1], [2, 4, 2, 3], [1, 2, 4, 2]]
  expect(s.order()).toBe(stackOrderReverse)
  expect(s(data)).toEqual([
    series([[9, 10], [9, 11], [8, 9]], data, 0, 3),
    series([[6, 9], [5, 9], [6, 8]], data, 1, 2),
    series([[1, 6], [3, 5], [2, 6]], data, 2, 1),
    series([[0, 1], [0, 3], [0, 2]], data, 3, 0),
  ])
})

it('stack.offset(null) is equivalent to stack.offset(stackOffsetNone)', () => {
  const s = stack().offset(null)
  expect(s.offset()).toBe(stackOffsetNone)
  expect(typeof s.offset()).toBe('function')
})

it('stack.offset(function) sets the offset function', () => {
  const s = stack().keys([0, 1, 2, 3]).offset(stackOffsetExpand)
  const data = [[1, 3, 5, 1], [2, 4, 2, 3], [1, 2, 4, 2]]
  expect(s.offset()).toBe(stackOffsetExpand)
  expect(s(data).map(roundSeries)).toEqual([
    [[0 / 10, 1 / 10], [0 / 11, 2 / 11], [0 / 9, 1 / 9]],
    [[1 / 10, 4 / 10], [2 / 11, 6 / 11], [1 / 9, 3 / 9]],
    [[4 / 10, 9 / 10], [6 / 11, 8 / 11], [3 / 9, 7 / 9]],
    [[9 / 10, 10 / 10], [8 / 11, 11 / 11], [7 / 9, 9 / 9]],
  ].map(roundSeries))
})

function series(series: any, data: any, key: any, index: any): any {
  data.forEach(function (d: any, i: any) { series[i].data = d })
  series.key = key
  series.index = index
  return series
}

function roundSeries(series: any): any {
  return series.map(function (point: any) {
    return point.map(function (value: any) {
      return Math.round(value * 1e6) / 1e6
    })
  })
}
