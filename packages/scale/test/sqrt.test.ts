import { expect, it } from 'bun:test'
import { scaleSqrt } from '../src/index.ts'

it('scaleSqrt() has the expected defaults', () => {
  const s = scaleSqrt()
  expect(s.domain()).toEqual([0, 1])
  expect(s.range()).toEqual([0, 1])
  expect(s.clamp()).toBe(false)
  expect(s.exponent!()).toBe(0.5)
  expect(s.interpolate()({array: ['red']}, {array: ['blue']})(0.5)).toEqual({array: ['rgb(128, 0, 128)']})
})

it('sqrt(x) maps a domain value x to a range value y', () => {
  expect(scaleSqrt()(0.5)).toBe(Math.SQRT1_2)
})
