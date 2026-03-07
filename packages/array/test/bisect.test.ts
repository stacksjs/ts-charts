import { describe, expect, it } from 'bun:test'
import { bisect, bisectLeft, bisectRight } from '../src/index.ts'

it('bisect is an alias for bisectRight', () => {
  expect(bisect).toBe(bisectRight)
})

it('bisectLeft(array, value) returns the index of an exact match', () => {
  const numbers = [1, 2, 3]
  expect(bisectLeft(numbers, 1)).toBe(0)
  expect(bisectLeft(numbers, 2)).toBe(1)
  expect(bisectLeft(numbers, 3)).toBe(2)
})

it('bisectLeft(array, value) returns the index of the first match', () => {
  const numbers = [1, 2, 2, 3]
  expect(bisectLeft(numbers, 1)).toBe(0)
  expect(bisectLeft(numbers, 2)).toBe(1)
  expect(bisectLeft(numbers, 3)).toBe(3)
})

it('bisectLeft(empty, value) returns zero', () => {
  expect(bisectLeft([], 1)).toBe(0)
})

it('bisectLeft(array, value) returns the insertion point of a non-exact match', () => {
  const numbers = [1, 2, 3]
  expect(bisectLeft(numbers, 0.5)).toBe(0)
  expect(bisectLeft(numbers, 1.5)).toBe(1)
  expect(bisectLeft(numbers, 2.5)).toBe(2)
  expect(bisectLeft(numbers, 3.5)).toBe(3)
})

it('bisectLeft(array, value) has undefined behavior if the search value is unorderable', () => {
  const numbers = [1, 2, 3]
  bisectLeft(numbers, new Date(NaN) as any)
  bisectLeft(numbers, undefined)
  bisectLeft(numbers, NaN)
})

it('bisectLeft(array, value, lo) observes the specified lower bound', () => {
  const numbers = [1, 2, 3, 4, 5]
  expect(bisectLeft(numbers, 0, 2)).toBe(2)
  expect(bisectLeft(numbers, 1, 2)).toBe(2)
  expect(bisectLeft(numbers, 2, 2)).toBe(2)
  expect(bisectLeft(numbers, 3, 2)).toBe(2)
  expect(bisectLeft(numbers, 4, 2)).toBe(3)
  expect(bisectLeft(numbers, 5, 2)).toBe(4)
  expect(bisectLeft(numbers, 6, 2)).toBe(5)
})

it('bisectLeft(array, value, lo, hi) observes the specified bounds', () => {
  const numbers = [1, 2, 3, 4, 5]
  expect(bisectLeft(numbers, 0, 2, 3)).toBe(2)
  expect(bisectLeft(numbers, 1, 2, 3)).toBe(2)
  expect(bisectLeft(numbers, 2, 2, 3)).toBe(2)
  expect(bisectLeft(numbers, 3, 2, 3)).toBe(2)
  expect(bisectLeft(numbers, 4, 2, 3)).toBe(3)
  expect(bisectLeft(numbers, 5, 2, 3)).toBe(3)
  expect(bisectLeft(numbers, 6, 2, 3)).toBe(3)
})

it('bisectLeft(array, value) handles large sparse d3', () => {
  const numbers: any[] = []
  let i = 1 << 30
  numbers[i++] = 1
  numbers[i++] = 2
  numbers[i++] = 3
  numbers[i++] = 4
  numbers[i++] = 5
  expect(bisectLeft(numbers, 0, i - 5, i)).toBe(i - 5)
  expect(bisectLeft(numbers, 1, i - 5, i)).toBe(i - 5)
  expect(bisectLeft(numbers, 2, i - 5, i)).toBe(i - 4)
  expect(bisectLeft(numbers, 3, i - 5, i)).toBe(i - 3)
  expect(bisectLeft(numbers, 4, i - 5, i)).toBe(i - 2)
  expect(bisectLeft(numbers, 5, i - 5, i)).toBe(i - 1)
  expect(bisectLeft(numbers, 6, i - 5, i)).toBe(i - 0)
})

it('bisectRight(array, value) returns the index after an exact match', () => {
  const numbers = [1, 2, 3]
  expect(bisectRight(numbers, 1)).toBe(1)
  expect(bisectRight(numbers, 2)).toBe(2)
  expect(bisectRight(numbers, 3)).toBe(3)
})

it('bisectRight(array, value) returns the index after the last match', () => {
  const numbers = [1, 2, 2, 3]
  expect(bisectRight(numbers, 1)).toBe(1)
  expect(bisectRight(numbers, 2)).toBe(3)
  expect(bisectRight(numbers, 3)).toBe(4)
})

it('bisectRight(empty, value) returns zero', () => {
  expect(bisectRight([], 1)).toBe(0)
})

it('bisectRight(array, value) returns the insertion point of a non-exact match', () => {
  const numbers = [1, 2, 3]
  expect(bisectRight(numbers, 0.5)).toBe(0)
  expect(bisectRight(numbers, 1.5)).toBe(1)
  expect(bisectRight(numbers, 2.5)).toBe(2)
  expect(bisectRight(numbers, 3.5)).toBe(3)
})

it('bisectRight(array, value, lo) observes the specified lower bound', () => {
  const numbers = [1, 2, 3, 4, 5]
  expect(bisectRight(numbers, 0, 2)).toBe(2)
  expect(bisectRight(numbers, 1, 2)).toBe(2)
  expect(bisectRight(numbers, 2, 2)).toBe(2)
  expect(bisectRight(numbers, 3, 2)).toBe(3)
  expect(bisectRight(numbers, 4, 2)).toBe(4)
  expect(bisectRight(numbers, 5, 2)).toBe(5)
  expect(bisectRight(numbers, 6, 2)).toBe(5)
})

it('bisectRight(array, value, lo, hi) observes the specified bounds', () => {
  const numbers = [1, 2, 3, 4, 5]
  expect(bisectRight(numbers, 0, 2, 3)).toBe(2)
  expect(bisectRight(numbers, 1, 2, 3)).toBe(2)
  expect(bisectRight(numbers, 2, 2, 3)).toBe(2)
  expect(bisectRight(numbers, 3, 2, 3)).toBe(3)
  expect(bisectRight(numbers, 4, 2, 3)).toBe(3)
  expect(bisectRight(numbers, 5, 2, 3)).toBe(3)
  expect(bisectRight(numbers, 6, 2, 3)).toBe(3)
})

it('bisectRight(array, value) handles large sparse d3', () => {
  const numbers: any[] = []
  let i = 1 << 30
  numbers[i++] = 1
  numbers[i++] = 2
  numbers[i++] = 3
  numbers[i++] = 4
  numbers[i++] = 5
  expect(bisectRight(numbers, 0, i - 5, i)).toBe(i - 5)
  expect(bisectRight(numbers, 1, i - 5, i)).toBe(i - 4)
  expect(bisectRight(numbers, 2, i - 5, i)).toBe(i - 3)
  expect(bisectRight(numbers, 3, i - 5, i)).toBe(i - 2)
  expect(bisectRight(numbers, 4, i - 5, i)).toBe(i - 1)
  expect(bisectRight(numbers, 5, i - 5, i)).toBe(i - 0)
  expect(bisectRight(numbers, 6, i - 5, i)).toBe(i - 0)
})

it('bisectLeft(array, value, lo, hi) keeps non-comparable values to the right', () => {
  const values = [1, 2, null, undefined, NaN]
  expect(bisectLeft(values, 1)).toBe(0)
  expect(bisectLeft(values, 2)).toBe(1)
  expect(bisectLeft(values, null)).toBe(5)
  expect(bisectLeft(values, undefined)).toBe(5)
  expect(bisectLeft(values, NaN)).toBe(5)
})

it('bisectLeft(array, value, lo, hi) keeps comparable values to the left', () => {
  const values = [null, undefined, NaN]
  expect(bisectLeft(values, 1)).toBe(0)
  expect(bisectLeft(values, 2)).toBe(0)
})

it('bisectRight(array, value, lo, hi) keeps non-comparable values to the right', () => {
  const values = [1, 2, null, undefined]
  expect(bisectRight(values, 1)).toBe(1)
  expect(bisectRight(values, 2)).toBe(2)
  expect(bisectRight(values, null)).toBe(4)
  expect(bisectRight(values, undefined)).toBe(4)
  expect(bisectRight(values, NaN)).toBe(4)
})
