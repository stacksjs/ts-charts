import { describe, expect, it } from 'bun:test'
import { interpolateDate } from '../src/index.ts'

it('interpolateDate(a, b) interpolates between two dates a and b', () => {
  const i = interpolateDate(new Date(2000, 0, 1), new Date(2000, 0, 2))
  expect(i(0.0) instanceof Date).toBe(true)
  expect(i(0.5) instanceof Date).toBe(true)
  expect(i(1.0) instanceof Date).toBe(true)
  expect(+i(0.2)).toBe(+new Date(2000, 0, 1, 4, 48))
  expect(+i(0.4)).toBe(+new Date(2000, 0, 1, 9, 36))
})

it('interpolateDate(a, b) reuses the output date', () => {
  const i = interpolateDate(new Date(2000, 0, 1), new Date(2000, 0, 2))
  expect(i(0.2)).toBe(i(0.4))
})

it('interpolateDate(a, b) gives exact ends for t=0 and t=1', () => {
  const a = new Date(1e8 * 24 * 60 * 60 * 1000), b = new Date(-1e8 * 24 * 60 * 60 * 1000 + 1)
  expect(+interpolateDate(a, b)(1)).toBe(+b)
  expect(+interpolateDate(a, b)(0)).toBe(+a)
})
