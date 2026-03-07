import { describe, expect, it } from 'bun:test'
import { every } from '../src/index.ts'

it('every(values, test) returns true if all tests pass', () => {
  expect(every([1, 2, 3, 2, 1], (x: any) => x & 1)).toBe(false)
  expect(every([1, 3, 5, 7], (x: any) => x & 1)).toBe(true)
})

it('every(values, test) returns true if values is empty', () => {
  expect(every([], () => false)).toBe(true)
})

it('every(values, test) accepts an iterable', () => {
  expect(every(new Set([1, 3, 5, 7]), (x: any) => x & 1)).toBe(true)
  expect(every((function*() { yield* [1, 3, 5, 7] })(), (x: any) => x & 1)).toBe(true)
})

it('every(values, test) enforces that test is a function', () => {
  expect(() => every([], null as any)).toThrow()
})

it('every(values, test) enforces that values is iterable', () => {
  expect(() => every({} as any, () => true)).toThrow()
})

it('every(values, test) passes test (value, index, values)', () => {
  const calls: any[] = []
  const values = new Set([5, 4, 3, 2, 1])
  every(values, (value: any, i: any, c: any) => { calls.push([value, i, c]); return true })
  expect(calls).toEqual([[5, 0, values], [4, 1, values], [3, 2, values], [2, 3, values], [1, 4, values]])
})
