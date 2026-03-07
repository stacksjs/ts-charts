import { describe, expect, it } from 'bun:test'
import { sort, ascending, descending } from '../src/index.ts'

it('sort(values) returns a sorted copy', () => {
  expect(sort([3, 2, 1])).toEqual([1, 2, 3])
})

it('sort(values) does not modify the input', () => {
  const input = [3, 2, 1]
  sort(input)
  expect(input).toEqual([3, 2, 1])
})

it('sort(values) accepts an iterable', () => {
  expect(sort(new Set([3, 2, 1]))).toEqual([1, 2, 3])
})

it('sort(values, comparator) returns a sorted copy', () => {
  expect(sort([3, 2, 1], ascending)).toEqual([1, 2, 3])
  expect(sort([3, 2, 1], descending)).toEqual([3, 2, 1])
})

it('sort(values, accessor) returns a sorted copy', () => {
  expect(sort([{v: 3}, {v: 2}, {v: 1}], (d: any) => d.v)).toEqual([{v: 1}, {v: 2}, {v: 3}])
})

it('sort(values, ...accessors) returns a sorted copy using multiple accessors', () => {
  expect(sort([{a: 1, b: 3}, {a: 1, b: 1}, {a: 2, b: 2}], (d: any) => d.a, (d: any) => d.b)).toEqual([{a: 1, b: 1}, {a: 1, b: 3}, {a: 2, b: 2}])
})

it('sort(values) enforces that values is iterable', () => {
  expect(() => sort({} as any)).toThrow()
})
