import { describe, expect, it } from 'bun:test'
import { union } from '../src/index.ts'
import { assertSetEqual } from './asserts.ts'

it('union(values) returns a set of values', () => {
  assertSetEqual(union([1, 2, 3, 2, 1]), [1, 2, 3])
})

it('union(values, other) returns a set of values', () => {
  assertSetEqual(union([1, 2], [2, 3, 1]), [1, 2, 3])
})

it('union(...others) accepts multiple iterables', () => {
  assertSetEqual(union([1], [2], [2, 3]), [1, 2, 3])
})
