import { describe, expect, it } from 'bun:test'
import { descending, greatestIndex } from '../src/index.ts'

it('greatestIndex(array) compares using natural order', () => {
  expect(greatestIndex([0, 1])).toBe(1)
  expect(greatestIndex([1, 0])).toBe(0)
})

it('greatestIndex(array, compare) compares using the specified compare function', () => {
  expect(greatestIndex([0, 1], descending)).toBe(0)
  expect(greatestIndex([1, 0], descending)).toBe(1)
})

it('greatestIndex(array, accessor) uses the specified accessor function', () => {
  expect(greatestIndex([{v: 0}, {v: 1}], (d: any) => d.v)).toBe(1)
  expect(greatestIndex([{v: 1}, {v: 0}], (d: any) => d.v)).toBe(0)
})

it('greatestIndex(array) returns -1 if the array is empty', () => {
  expect(greatestIndex([])).toBe(-1)
})
