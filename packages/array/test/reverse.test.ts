import { describe, expect, it } from 'bun:test'
import { reverse } from '../src/index.ts'

it('reverse(values) returns a reversed copy', () => {
  expect(reverse([3, 2, 1])).toEqual([1, 2, 3])
  expect(reverse([1, 2, 3])).toEqual([3, 2, 1])
})

it('reverse(values) accepts an iterable', () => {
  expect(reverse(new Set([3, 2, 1]))).toEqual([1, 2, 3])
})

it('reverse(values) does not modify the input', () => {
  const input = [3, 2, 1]
  reverse(input)
  expect(input).toEqual([3, 2, 1])
})

it('reverse(values) enforces that values is iterable', () => {
  expect(() => reverse({} as any)).toThrow()
})
