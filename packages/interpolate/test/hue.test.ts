import { describe, expect, it } from 'bun:test'
import { interpolateHue } from '../src/index.ts'

it('interpolateHue(a, b) interpolate numbers', () => {
  const i = interpolateHue('10', '20')
  expect(i(0.0)).toBe(10)
  expect(i(0.2)).toBe(12)
  expect(i(0.4)).toBe(14)
  expect(i(0.6)).toBe(16)
  expect(i(0.8)).toBe(18)
  expect(i(1.0)).toBe(20)
})

it('interpolateHue(a, b) returns a if b is NaN', () => {
  const i = interpolateHue(10, NaN)
  expect(i(0.0)).toBe(10)
  expect(i(0.5)).toBe(10)
  expect(i(1.0)).toBe(10)
})

it('interpolateHue(a, b) returns b if a is NaN', () => {
  const i = interpolateHue(NaN, 20)
  expect(i(0.0)).toBe(20)
  expect(i(0.5)).toBe(20)
  expect(i(1.0)).toBe(20)
})

it('interpolateHue(a, b) returns NaN if both a and b are NaN', () => {
  const i = interpolateHue(NaN, NaN)
  expect(isNaN(i(0.0))).toBe(true)
  expect(isNaN(i(0.5))).toBe(true)
  expect(isNaN(i(1.0))).toBe(true)
})

it('interpolateHue(a, b) uses the shortest path', () => {
  const i = interpolateHue(10, 350)
  expect(i(0.0)).toBe(10)
  expect(i(0.2)).toBe(6)
  expect(i(0.4)).toBe(2)
  expect(i(0.6)).toBe(358)
  expect(i(0.8)).toBe(354)
  expect(i(1.0)).toBe(350)
})
