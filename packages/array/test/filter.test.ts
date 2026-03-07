import { describe, expect, it } from 'bun:test'
import { filter } from '../src/index.ts'

it('filter(values, test) returns the filtered values', () => {
  expect(filter([1, 2, 3, 2, 1], (x: any) => x & 1)).toEqual([1, 3, 1])
})

it('filter(values, test) accepts an iterable', () => {
  expect(filter(new Set([1, 2, 3]), (x: any) => x >= 2)).toEqual([2, 3])
})

it('filter(values, test) enforces that test is a function', () => {
  expect(() => filter([], null as any)).toThrow()
})

it('filter(values, test) passes test (value, index, values)', () => {
  const calls: any[] = []
  const values = new Set([5, 4, 3, 2, 1])
  filter(values, (value: any, i: any, c: any) => { calls.push([value, i, c]); return true })
  expect(calls).toEqual([[5, 0, values], [4, 1, values], [3, 2, values], [2, 3, values], [1, 4, values]])
})
