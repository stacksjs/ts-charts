import { describe, expect, it } from 'bun:test'
import { interpolate, piecewise } from '../src/index.ts'

it('piecewise(interpolate, values)(t) returns the expected values', () => {
  const i = piecewise(interpolate, [0, 2, 10])
  expect(i(-1)).toBe(-4)
  expect(i(0)).toBe(0)
  expect(i(0.19)).toBe(0.76)
  expect(i(0.21)).toBe(0.84)
  expect(i(0.5)).toBe(2)
  expect(i(0.75)).toBe(6)
  expect(i(1)).toBe(10)
})

it('piecewise(values) uses the default interpolator', () => {
  const i = piecewise([0, 2, 10])
  expect(i(-1)).toBe(-4)
  expect(i(0)).toBe(0)
  expect(i(0.19)).toBe(0.76)
  expect(i(0.21)).toBe(0.84)
  expect(i(0.5)).toBe(2)
  expect(i(0.75)).toBe(6)
  expect(i(1)).toBe(10)
})

it('piecewise(values) uses the default interpolator/2', () => {
  const i = piecewise(['a0', 'a2', 'a10'])
  expect(i(-1)).toBe('a-4')
  expect(i(0)).toBe('a0')
  expect(i(0.19)).toBe('a0.76')
  expect(i(0.21)).toBe('a0.84')
  expect(i(0.5)).toBe('a2')
  expect(i(0.75)).toBe('a6')
  expect(i(1)).toBe('a10')
})
