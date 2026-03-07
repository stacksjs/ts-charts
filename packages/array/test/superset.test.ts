import { describe, expect, it } from 'bun:test'
import { superset } from '../src/index.ts'

it('superset(values, other) returns true if values is a superset of other', () => {
  expect(superset([1, 2], [2])).toBe(true)
  expect(superset([2, 3], [3, 4])).toBe(false)
  expect(superset([1], [])).toBe(true)
})
