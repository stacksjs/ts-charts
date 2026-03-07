import { describe, expect, it } from 'bun:test'
import { some } from '../src/index.ts'

it('some(values, test) returns true if any test passes', () => {
  expect(some([1, 2, 3, 2, 1], (x: any) => x & 1)).toBe(true)
  expect(some([1, 2, 3, 2, 1], (x: any) => x > 3)).toBe(false)
})

it('some(values, test) returns false if values is empty', () => {
  expect(some([], () => true)).toBe(false)
})

it('some(values, test) accepts an iterable', () => {
  expect(some(new Set([1, 2, 3, 2, 1]), (x: any) => x >= 3)).toBe(true)
  expect(some((function*() { yield* [1, 2, 3, 2, 1] })(), (x: any) => x >= 3)).toBe(true)
  expect(some((function*() { yield* [1, 2, 3, 2, 1] })(), (x: any) => x >= 4)).toBe(false)
})

it('some(values, test) enforces that test is a function', () => {
  expect(() => some([], null as any)).toThrow()
})

it('some(values, test) passes test (value, index, values)', () => {
  const calls: any[] = []
  const values = new Set([5, 4, 3, 2, 1])
  some(values, (value: any, i: any, c: any) => { calls.push([value, i, c]); return false })
  expect(calls).toEqual([[5, 0, values], [4, 1, values], [3, 2, values], [2, 3, values], [1, 4, values]])
})
