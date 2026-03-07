import { describe, expect, it } from 'bun:test'
import { thresholdFreedmanDiaconis } from '../../src/index.ts'

it('thresholdFreedmanDiaconis(values, min, max) returns the expected result', () => {
  expect(thresholdFreedmanDiaconis([4, 3, 2, 1, NaN], 1, 4)).toBe(2)
})

it('thresholdFreedmanDiaconis(values, min, max) handles values with zero deviation', () => {
  expect(thresholdFreedmanDiaconis([1, 1, 1, 1], 1, 4)).toBe(1)
})

it('thresholdFreedmanDiaconis(values, min, max) handles single-value arrays', () => {
  expect(thresholdFreedmanDiaconis([1], 1, 4)).toBe(1)
})

it('thresholdFreedmanDiaconis(values, min, max) handles empty arrays', () => {
  expect(thresholdFreedmanDiaconis([], 1, 4)).toBe(1)
})
