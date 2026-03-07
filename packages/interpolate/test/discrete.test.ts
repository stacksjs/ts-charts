import { describe, expect, it } from 'bun:test'
import { interpolateDiscrete } from '../src/index.ts'

it('interpolateDiscrete(values)(t) returns the expected values', () => {
  const i = interpolateDiscrete('abcde'.split(''))
  expect(i(-1)).toBe('a')
  expect(i(0)).toBe('a')
  expect(i(0.19)).toBe('a')
  expect(i(0.21)).toBe('b')
  expect(i(1)).toBe('e')
})

it('interpolateDiscrete([0, 1]) is equivalent to similar to Math.round', () => {
  const i = interpolateDiscrete([0, 1])
  expect(i(-1)).toBe(0)
  expect(i(0)).toBe(0)
  expect(i(0.49)).toBe(0)
  expect(i(0.51)).toBe(1)
  expect(i(1)).toBe(1)
  expect(i(2)).toBe(1)
})

it('interpolateDiscrete(...)(NaN) returned undefined', () => {
  const i = interpolateDiscrete([0, 1]) as any
  expect(i(NaN)).toBe(undefined)
})
