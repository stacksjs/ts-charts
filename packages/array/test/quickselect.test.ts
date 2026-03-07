import { describe, expect, it } from 'bun:test'
import { quickselect } from '../src/index.ts'

it('quickselect(array, k) puts the kth largest item in the kth spot', () => {
  const array = [7, 1, 3, 2, 5, 9, 8, 4, 0, 6]
  expect(quickselect(array.slice(), 4)[4]).toBe(4)
  expect(quickselect(array.slice(), 0)[0]).toBe(0)
  expect(quickselect(array.slice(), 9)[9]).toBe(9)
})

it('quickselect(array, k) ensures all elements before k are <= array[k]', () => {
  const array = [7, 1, 3, 2, 5, 9, 8, 4, 0, 6]
  const result = quickselect(array.slice(), 4)
  for (let i = 0; i < 4; i++) {
    expect(result[i] <= result[4]).toBe(true)
  }
  for (let i = 5; i < 10; i++) {
    expect(result[i] >= result[4]).toBe(true)
  }
})

it('quickselect(array, k) returns the input array', () => {
  const array = [7, 1, 3, 2, 5]
  expect(quickselect(array, 2)).toBe(array)
})
