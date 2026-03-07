import { describe, expect, it } from 'bun:test'
import { rank, descending } from '../src/index.ts'

it('rank(array) returns the rank of every value', () => {
  expect(rank([3, 1, 2])).toEqual(new Float64Array([2, 0, 1]))
  expect(rank([1, 2, 3])).toEqual(new Float64Array([0, 1, 2]))
  expect(rank([3, 2, 1])).toEqual(new Float64Array([2, 1, 0]))
  expect(rank([1, 1, 2])).toEqual(new Float64Array([0, 0, 2]))
  expect(rank([1, 2, 2])).toEqual(new Float64Array([0, 1, 1]))
})

it('rank(array) handles NaN', () => {
  const r = rank([NaN, 1, 2])
  expect(isNaN(r[0])).toBe(true)
  expect(r[1]).toBe(0)
  expect(r[2]).toBe(1)
})

it('rank(array, accessor) uses the specified accessor', () => {
  expect(rank([{v: 3}, {v: 1}, {v: 2}], (d: any) => d.v)).toEqual(new Float64Array([2, 0, 1]))
})

it('rank(array, comparator) uses the specified comparator', () => {
  expect(rank([3, 1, 2], descending)).toEqual(new Float64Array([0, 2, 1]))
})
