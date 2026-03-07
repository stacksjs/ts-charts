import { describe, expect, it } from 'bun:test'
import { descending, greatest } from '../src/index.ts'

it('greatest(array) compares using natural order', () => {
  expect(greatest([0, 1])).toBe(1)
  expect(greatest([1, 0])).toBe(1)
  expect(greatest([0, '1'])).toBe('1')
  expect(greatest(['1', 0])).toBe('1')
  expect(greatest(['10', '9'])).toBe('9')
  expect(greatest(['0', null])).toBe('0')
  expect(greatest([0, undefined])).toBe(0)
  expect(greatest([0, NaN])).toBe(0)
  expect(greatest([NaN, undefined])).toBe(undefined)
})

it('greatest(array, compare) compares using the specified compare function', () => {
  expect(greatest([0, 1], descending)).toBe(0)
  expect(greatest([1, 0], descending)).toBe(0)
})

it('greatest(array, accessor) uses the specified accessor function', () => {
  expect(greatest([{v: 0}, {v: 1}], (d: any) => d.v)).toEqual({v: 1})
  expect(greatest([{v: 1}, {v: 0}], (d: any) => d.v)).toEqual({v: 1})
})

it('greatest(array) returns undefined if the array is empty', () => {
  expect(greatest([])).toBe(undefined)
})

it('greatest(array) returns undefined if the array contains only incomparable values', () => {
  expect(greatest([NaN, undefined])).toBe(undefined)
  expect(greatest([NaN, NaN])).toBe(undefined)
})
