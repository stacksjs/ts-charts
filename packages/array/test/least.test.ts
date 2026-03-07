import { describe, expect, it } from 'bun:test'
import { descending, least } from '../src/index.ts'

it('least(array) compares using natural order', () => {
  expect(least([0, 1])).toBe(0)
  expect(least([1, 0])).toBe(0)
  expect(least([0, '1'])).toBe(0)
  expect(least(['1', 0])).toBe(0)
  expect(least(['10', '9'])).toBe('10')
  expect(least([null, '0'])).toBe('0')
  expect(least([undefined, 0])).toBe(0)
  expect(least([NaN, 0])).toBe(0)
  expect(least([undefined, NaN])).toBe(undefined)
})

it('least(array, compare) compares using the specified compare function', () => {
  expect(least([0, 1], descending)).toBe(1)
  expect(least([1, 0], descending)).toBe(1)
})

it('least(array, accessor) uses the specified accessor function', () => {
  expect(least([{v: 0}, {v: 1}], (d: any) => d.v)).toEqual({v: 0})
  expect(least([{v: 1}, {v: 0}], (d: any) => d.v)).toEqual({v: 0})
})

it('least(array) returns undefined if the array is empty', () => {
  expect(least([])).toBe(undefined)
})

it('least(array) returns undefined if the array contains only incomparable values', () => {
  expect(least([NaN, undefined])).toBe(undefined)
  expect(least([NaN, NaN])).toBe(undefined)
})
