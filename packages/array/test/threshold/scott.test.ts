import { describe, expect, it } from 'bun:test'
import { thresholdScott } from '../../src/index.ts'

it('thresholdScott(values, min, max) returns the expected result', () => {
  expect(thresholdScott([4, 3, 2, 1, NaN], 1, 4)).toBe(2)
})

it('thresholdScott(values, min, max) handles values with zero deviation', () => {
  expect(thresholdScott([1, 1, 1, 1], 1, 4)).toBe(1)
})

it('thresholdScott(values, min, max) handles single-value arrays', () => {
  expect(thresholdScott([1], 1, 4)).toBe(1)
})

it('thresholdScott(values, min, max) handles empty arrays', () => {
  expect(thresholdScott([], 1, 4)).toBe(1)
})
