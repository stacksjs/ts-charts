import { describe, expect, it } from 'bun:test'
import { hsl, rgb } from '@ts-charts/color'
import { interpolate } from '../src/index.ts'

it('interpolate(a, b) interpolates strings if b is a string and not a color', () => {
  expect(interpolate('foo', 'bar')(0.5)).toBe('bar')
})

it('interpolate(a, b) interpolates strings if b is a string and not a color, even if b is coercible to a number', () => {
  expect(interpolate('1', '2')(0.5)).toBe('1.5')
  expect(interpolate(' 1', ' 2')(0.5)).toBe(' 1.5')
})

it('interpolate(a, b) interpolates RGB colors if b is a string and a color', () => {
  expect(interpolate('red', 'blue')(0.5)).toBe('rgb(128, 0, 128)')
  expect(interpolate('#ff0000', '#0000ff')(0.5)).toBe('rgb(128, 0, 128)')
  expect(interpolate('#f00', '#00f')(0.5)).toBe('rgb(128, 0, 128)')
  expect(interpolate('rgb(255, 0, 0)', 'rgb(0, 0, 255)')(0.5)).toBe('rgb(128, 0, 128)')
  expect(interpolate('rgba(255, 0, 0, 1.0)', 'rgba(0, 0, 255, 1.0)')(0.5)).toBe('rgb(128, 0, 128)')
  expect(interpolate('rgb(100%, 0%, 0%)', 'rgb(0%, 0%, 100%)')(0.5)).toBe('rgb(128, 0, 128)')
  expect(interpolate('rgba(100%, 0%, 0%, 1.0)', 'rgba(0%, 0%, 100%, 1.0)')(0.5)).toBe('rgb(128, 0, 128)')
  expect(interpolate('rgba(100%, 0%, 0%, 0.5)', 'rgba(0%, 0%, 100%, 0.7)')(0.5)).toBe('rgba(128, 0, 128, 0.6)')
})

it('interpolate(a, b) interpolates RGB colors if b is a color', () => {
  expect(interpolate('red', rgb('blue'))(0.5)).toBe('rgb(128, 0, 128)')
  expect(interpolate('red', hsl('blue'))(0.5)).toBe('rgb(128, 0, 128)')
})

it('interpolate(a, b) interpolates arrays if b is an array', () => {
  expect(interpolate(['red'], ['blue'])(0.5)).toEqual(['rgb(128, 0, 128)'])
})

it('interpolate(a, b) interpolates arrays if b is an array, even if b is coercible to a number', () => {
  expect(interpolate([1], [2])(0.5)).toEqual([1.5])
})

it('interpolate(a, b) interpolates numbers if b is a number', () => {
  expect(interpolate(1, 2)(0.5)).toBe(1.5)
  expect(isNaN(interpolate(1, NaN)(0.5))).toBe(true)
})

it('interpolate(a, b) interpolates objects if b is an object that is not coercible to a number', () => {
  expect(interpolate({ color: 'red' }, { color: 'blue' })(0.5)).toEqual({ color: 'rgb(128, 0, 128)' })
})

it('interpolate(a, b) interpolates numbers if b is an object that is coercible to a number', () => {
  expect(interpolate(1, new Number(2))(0.5)).toBe(1.5)
  expect(interpolate(1, new String('2'))(0.5)).toBe(1.5)
})

it('interpolate(a, b) interpolates dates if b is a date', () => {
  const i = interpolate(new Date(2000, 0, 1), new Date(2000, 0, 2))
  const d = i(0.5)
  expect(d instanceof Date).toBe(true)
  expect(+i(0.5)).toBe(+new Date(2000, 0, 1, 12))
})

it('interpolate(a, b) returns the constant b if b is null, undefined or a boolean', () => {
  expect(interpolate(0, null)(0.5)).toBe(null)
  expect(interpolate(0, undefined)(0.5)).toBe(undefined)
  expect(interpolate(0, true)(0.5)).toBe(true)
  expect(interpolate(0, false)(0.5)).toBe(false)
})

it('interpolate(a, b) interpolates objects without prototype', () => {
  expect(interpolate(noproto({ foo: 0 }), noproto({ foo: 2 }))(0.5)).toEqual({ foo: 1 })
})

it('interpolate(a, b) interpolates objects with numeric valueOf as numbers', () => {
  const proto = { valueOf: foo }
  expect(interpolate(noproto({ foo: 0 }, proto), noproto({ foo: 2 }, proto))(0.5)).toEqual(1)
})

it('interpolate(a, b) interpolates objects with string valueOf as numbers if valueOf result is coercible to number', () => {
  const proto = { valueOf: fooString }
  expect(interpolate(noproto({ foo: 0 }, proto), noproto({ foo: 2 }, proto))(0.5)).toEqual(1)
})

// valueOf appears here as object because:
// - we use for-in loop and it will ignore only fields coming from built-in prototypes;
// - we replace functions with objects.
it('interpolate(a, b) interpolates objects with string valueOf as objects if valueOf result is not coercible to number', () => {
  const proto = { valueOf: fooString }
  expect(interpolate(noproto({ foo: 'bar' }, proto), noproto({ foo: 'baz' }, proto))(0.5)).toEqual({ foo: 'baz', valueOf: {} })
})

it('interpolate(a, b) interpolates objects with toString as numbers if toString result is coercible to number', () => {
  const proto = { toString: fooString }
  expect(interpolate(noproto({ foo: 0 }, proto), noproto({ foo: 2 }, proto))(0.5)).toEqual(1)
})

// toString appears here as object because:
// - we use for-in loop and it will ignore only fields coming from built-in prototypes;
// - we replace functions with objects.
it('interpolate(a, b) interpolates objects with toString as objects if toString result is not coercible to number', () => {
  const proto = { toString: fooString }
  expect(interpolate(noproto({ foo: 'bar' }, proto), noproto({ foo: 'baz' }, proto))(0.5)).toEqual({ foo: 'baz', toString: {} })
})

it('interpolate(a, b) interpolates number arrays if b is a typed array', () => {
  expect(interpolate([0, 0], Float64Array.of(-1, 1))(0.5)).toEqual(Float64Array.of(-0.5, 0.5))
  expect(interpolate([0, 0], Float64Array.of(-1, 1))(0.5) instanceof Float64Array).toBe(true)
  expect(interpolate([0, 0], Float32Array.of(-1, 1))(0.5)).toEqual(Float32Array.of(-0.5, 0.5))
  expect(interpolate([0, 0], Float32Array.of(-1, 1))(0.5) instanceof Float32Array).toBe(true)
  expect(interpolate([0, 0], Uint32Array.of(-2, 2))(0.5)).toEqual(Uint32Array.of(Math.pow(2, 31) - 1, 1))
  expect(interpolate([0, 0], Uint32Array.of(-1, 1))(0.5) instanceof Uint32Array).toBe(true)
  expect(interpolate([0, 0], Uint8Array.of(-2, 2))(0.5)).toEqual(Uint8Array.of(Math.pow(2, 7) - 1, 1))
  expect(interpolate([0, 0], Uint8Array.of(-1, 1))(0.5) instanceof Uint8Array).toBe(true)
})

function noproto(properties: Record<string, any>, proto: any = null): any {
  return Object.assign(Object.create(proto), properties)
}

function foo(this: any): any {
  return this.foo
}

function fooString(this: any): string {
  return String(this.foo)
}
