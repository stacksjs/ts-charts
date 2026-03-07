import { describe, expect, it } from 'bun:test'
import { intersection } from '../src/index.ts'
import { assertSetEqual } from './asserts.ts'

it('intersection(values, other) returns a set of values', () => {
  assertSetEqual(intersection([1, 2, 3], [2, 1]), [1, 2])
  assertSetEqual(intersection([1, 2], [2, 3, 1]), [1, 2])
  assertSetEqual(intersection([2, 1, 3], [4, 3, 1]), [1, 3])
})

it('intersection(values, other) accepts iterables', () => {
  assertSetEqual(intersection(new Set([1, 2, 3]), new Set([1])), [1])
})

it('intersection(values) returns a copy', () => {
  assertSetEqual(intersection([1, 2, 3]), [1, 2, 3])
})

it('intersection(...others) accepts multiple others', () => {
  assertSetEqual(intersection([1, 2, 3, 4], [2, 3], [3, 4]), [3])
})
