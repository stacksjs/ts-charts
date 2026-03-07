import { describe, expect, it } from 'bun:test'
import { reduce } from '../src/index.ts'

it('reduce(values, reducer) reduces the values', () => {
  expect(reduce([1, 2, 3, 2, 1], (p: any, v: any) => p + v)).toBe(9)
})

it('reduce(values, reducer, initial) reduces with an initial value', () => {
  expect(reduce([1, 2, 3], (p: any, v: any) => p + v, 10)).toBe(16)
})

it('reduce(values, reducer) accepts an iterable', () => {
  expect(reduce(new Set([1, 2, 3]), (p: any, v: any) => p + v)).toBe(6)
})

it('reduce(values, reducer) enforces that reducer is a function', () => {
  expect(() => reduce([], null as any)).toThrow()
})

it('reduce(values, reducer) passes (p, v, i, values)', () => {
  const calls: any[] = []
  const values = [5, 4, 3]
  reduce(values, (p: any, v: any, i: any, c: any) => { calls.push([p, v, i, c]); return p + v })
  expect(calls).toEqual([[5, 4, 1, values], [9, 3, 2, values]])
})
