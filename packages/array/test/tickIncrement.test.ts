import { describe, expect, it } from 'bun:test'
import { tickIncrement } from '../src/index.ts'

it('tickIncrement(start, stop, count) returns the expected value', () => {
  // For [0, 1, 10]: step = 0.1, power = -1, error = 1, factor = 1
  // power < 0: inc = 10^1 / 1 = 10, then negated: inc = -10
  expect(tickIncrement(0, 1, 10)).toBe(-10)
})

it('tickIncrement(start, stop, count) returns 1 for [0, 10, 10]', () => {
  expect(tickIncrement(0, 10, 10)).toBe(1)
})
