import { describe, expect, it } from 'bun:test'
import { descending, leastIndex } from '../src/index.ts'

it('leastIndex(array) compares using natural order', () => {
  expect(leastIndex([0, 1])).toBe(0)
  expect(leastIndex([1, 0])).toBe(1)
})

it('leastIndex(array, compare) compares using the specified compare function', () => {
  expect(leastIndex([0, 1], descending)).toBe(1)
  expect(leastIndex([1, 0], descending)).toBe(0)
})

it('leastIndex(array, accessor) uses the specified accessor function', () => {
  expect(leastIndex([{v: 0}, {v: 1}], (d: any) => d.v)).toBe(0)
  expect(leastIndex([{v: 1}, {v: 0}], (d: any) => d.v)).toBe(1)
})

it('leastIndex(array) returns -1 if the array is empty', () => {
  expect(leastIndex([])).toBe(-1)
})
