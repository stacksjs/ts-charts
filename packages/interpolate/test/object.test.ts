import { describe, expect, it } from 'bun:test'
import { interpolateObject } from '../src/index.ts'

it('interpolateObject(a, b) interpolates defined properties in a and b', () => {
  expect(interpolateObject({ a: 2, b: 12 }, { a: 4, b: 24 })(0.5)).toEqual({ a: 3, b: 18 })
})

it('interpolateObject(a, b) interpolates inherited properties in a and b', () => {
  const a = function (this: any, val: number) { this.a = val } as any
  a.prototype.b = 12
  expect(interpolateObject(new (a as any)(2), { a: 4, b: 12 })(0.5)).toEqual({ a: 3, b: 12 })
  expect(interpolateObject({ a: 2, b: 12 }, new (a as any)(4))(0.5)).toEqual({ a: 3, b: 12 })
  expect(interpolateObject(new (a as any)(4), new (a as any)(2))(0.5)).toEqual({ a: 3, b: 12 })
})

it('interpolateObject(a, b) interpolates color properties as rgb', () => {
  expect(interpolateObject({ background: 'red' }, { background: 'green' })(0.5)).toEqual({ background: 'rgb(128, 64, 0)' })
  expect(interpolateObject({ fill: 'red' }, { fill: 'green' })(0.5)).toEqual({ fill: 'rgb(128, 64, 0)' })
  expect(interpolateObject({ stroke: 'red' }, { stroke: 'green' })(0.5)).toEqual({ stroke: 'rgb(128, 64, 0)' })
  expect(interpolateObject({ color: 'red' }, { color: 'green' })(0.5)).toEqual({ color: 'rgb(128, 64, 0)' })
})

it('interpolateObject(a, b) interpolates nested objects and arrays', () => {
  expect(interpolateObject({ foo: [2, 12] }, { foo: [4, 24] })(0.5)).toEqual({ foo: [3, 18] })
  expect(interpolateObject({ foo: { bar: [2, 12] } }, { foo: { bar: [4, 24] } })(0.5)).toEqual({ foo: { bar: [3, 18] } })
})

it('interpolateObject(a, b) ignores properties in a that are not in b', () => {
  expect(interpolateObject({ foo: 2, bar: 12 }, { foo: 4 })(0.5)).toEqual({ foo: 3 })
})

it('interpolateObject(a, b) uses constant properties in b that are not in a', () => {
  expect(interpolateObject({ foo: 2 }, { foo: 4, bar: 12 })(0.5)).toEqual({ foo: 3, bar: 12 })
})

it('interpolateObject(a, b) treats undefined as an empty object', () => {
  expect(interpolateObject(NaN, { foo: 2 })(0.5)).toEqual({ foo: 2 })
  expect(interpolateObject({ foo: 2 }, undefined)(0.5)).toEqual({})
  expect(interpolateObject(undefined, { foo: 2 })(0.5)).toEqual({ foo: 2 })
  expect(interpolateObject({ foo: 2 }, null)(0.5)).toEqual({})
  expect(interpolateObject(null, { foo: 2 })(0.5)).toEqual({ foo: 2 })
  expect(interpolateObject(null, NaN)(0.5)).toEqual({})
})

it('interpolateObject(a, b) interpolates objects without prototype', () => {
  expect(interpolateObject(noproto({ foo: 0 }), noproto({ foo: 2 }))(0.5)).toEqual({ foo: 1 })
})

function noproto(properties: Record<string, any>): Record<string, any> {
  return Object.assign(Object.create(null), properties)
}
