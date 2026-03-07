import { describe, expect, it } from 'bun:test'
import { disjoint } from '../src/index.ts'

it('disjoint(values, other) returns true if sets are disjoint', () => {
  expect(disjoint([1], [2])).toBe(true)
  expect(disjoint([2, 3], [3, 4])).toBe(false)
  expect(disjoint([1], [1])).toBe(false)
})

it('disjoint(values, other) allows values to be infinite', () => {
  expect(disjoint(odds(), [0, 2, 4, 5])).toBe(false)
})

function* odds() { for (let i = 1; true; i += 2) yield i }
