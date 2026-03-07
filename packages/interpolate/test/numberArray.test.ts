import { describe, expect, it } from 'bun:test'
import { interpolateNumberArray } from '../src/index.ts'

it('interpolateNumberArray(a, b) interpolates defined elements in a and b', () => {
  expect(interpolateNumberArray(Float64Array.of(2, 12), Float64Array.of(4, 24))(0.5)).toEqual(Float64Array.of(3, 18))
})

it('interpolateNumberArray(a, b) ignores elements in a that are not in b', () => {
  expect(interpolateNumberArray(Float64Array.of(2, 12, 12), Float64Array.of(4, 24))(0.5)).toEqual(Float64Array.of(3, 18))
})

it('interpolateNumberArray(a, b) uses constant elements in b that are not in a', () => {
  expect(interpolateNumberArray(Float64Array.of(2, 12), Float64Array.of(4, 24, 12))(0.5)).toEqual(Float64Array.of(3, 18, 12))
})

it('interpolateNumberArray(a, b) treats undefined as an empty array', () => {
  expect(interpolateNumberArray(undefined, [2, 12])(0.5)).toEqual([2, 12])
  expect(interpolateNumberArray([2, 12], undefined)(0.5)).toEqual([])
  expect(interpolateNumberArray(undefined, undefined)(0.5)).toEqual([])
})

it('interpolateNumberArray(a, b) uses b\'s array type', () => {
  expect(interpolateNumberArray(Float64Array.of(2, 12), Float64Array.of(4, 24, 12))(0.5) instanceof Float64Array).toBe(true)
  expect(interpolateNumberArray(Float64Array.of(2, 12), Float32Array.of(4, 24, 12))(0.5) instanceof Float32Array).toBe(true)
  expect(interpolateNumberArray(Float64Array.of(2, 12), Uint8Array.of(4, 24, 12))(0.5) instanceof Uint8Array).toBe(true)
  expect(interpolateNumberArray(Float64Array.of(2, 12), Uint16Array.of(4, 24, 12))(0.5) instanceof Uint16Array).toBe(true)
})

it('interpolateNumberArray(a, b) works with unsigned data', () => {
  expect(interpolateNumberArray(Uint8Array.of(1, 12), Uint8Array.of(255, 0))(0.5)).toEqual(Uint8Array.of(128, 6))
})

it('interpolateNumberArray(a, b) gives exact ends', () => {
  const i = interpolateNumberArray(Float64Array.of(2e42), Float64Array.of(355))
  expect(i(0)).toEqual(Float64Array.of(2e42))
  expect(i(1)).toEqual(Float64Array.of(355))
})
