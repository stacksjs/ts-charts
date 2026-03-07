import { describe, expect, it } from 'bun:test'
import { interpolateNumber } from '../src/index.ts'

it('interpolateNumber(a, b) interpolates between two numbers a and b', () => {
  const i = interpolateNumber(10, 42)
  expect(Math.abs(i(0.0) - 10.0)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.1) - 13.2)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.2) - 16.4)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.3) - 19.6)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.4) - 22.8)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.5) - 26.0)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.6) - 29.2)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.7) - 32.4)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.8) - 35.6)).toBeLessThan(1e-6)
  expect(Math.abs(i(0.9) - 38.8)).toBeLessThan(1e-6)
  expect(Math.abs(i(1.0) - 42.0)).toBeLessThan(1e-6)
})

it('interpolateNumber(a, b) gives exact ends for t=0 and t=1', () => {
  const a = 2e+42, b = 335
  expect(interpolateNumber(a, b)(1)).toBe(b)
  expect(interpolateNumber(a, b)(0)).toBe(a)
})
