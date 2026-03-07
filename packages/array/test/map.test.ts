import { describe, expect, it } from 'bun:test'
import { map } from '../src/index.ts'

it('map(values, mapper) returns the mapped values', () => {
  expect(map([1, 2, 3], (x: any) => x * 2)).toEqual([2, 4, 6])
})

it('map(values, mapper) accepts an iterable', () => {
  expect(map(new Set([1, 2, 3]), (x: any) => x * 2)).toEqual([2, 4, 6])
})

it('map(values, mapper) enforces that mapper is a function', () => {
  expect(() => map([], null as any)).toThrow()
})

it('map(values, mapper) enforces that values is iterable', () => {
  expect(() => map({} as any, () => true)).toThrow()
})

it('map(values, mapper) passes mapper (value, index, values)', () => {
  const calls: any[] = []
  const values = new Set([5, 4, 3, 2, 1])
  map(values, (value: any, i: any, c: any) => { calls.push([value, i, c]); return value })
  expect(calls).toEqual([[5, 0, values], [4, 1, values], [3, 2, values], [2, 3, values], [1, 4, values]])
})
