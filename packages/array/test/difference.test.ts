import { describe, expect, it } from 'bun:test'
import { difference } from '../src/index.ts'
import { assertSetEqual } from './asserts.ts'

it('difference(values, other) returns a set of values', () => {
  assertSetEqual(difference([1, 2, 3], [2, 1]), [3])
  assertSetEqual(difference([1, 2], [2, 3, 1]), [])
  assertSetEqual(difference([2, 1, 3], [4, 3, 1]), [2])
})

it('difference(values, other) accepts iterables', () => {
  assertSetEqual(difference(new Set([1, 2, 3]), new Set([1])), [2, 3])
})

it('difference(...others) accepts multiple others', () => {
  assertSetEqual(difference([1, 2, 3, 4], [2], [3]), [1, 4])
})
