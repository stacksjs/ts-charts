import { describe, expect, it } from 'bun:test'
import { subset } from '../src/index.ts'

it('subset(values, other) returns true if values is a subset of other', () => {
  expect(subset([2], [1, 2])).toBe(true)
  expect(subset([3, 4], [2, 3])).toBe(false)
  expect(subset([], [1])).toBe(true)
})
