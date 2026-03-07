import { describe, expect, it } from 'bun:test'
import { thresholdSturges } from '../../src/index.ts'

it('thresholdSturges(values, min, max) returns the expected result', () => {
  expect(thresholdSturges([4, 3, 2, 1, NaN])).toBe(3)
  expect(thresholdSturges([1])).toBe(1)
})

it('thresholdSturges(values, min, max) handles empty arrays', () => {
  expect(thresholdSturges([])).toBe(1)
})
