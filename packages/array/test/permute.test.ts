import { describe, expect, it } from 'bun:test'
import { permute } from '../src/index.ts'

it('permute(array, indexes) returns a permutation of the array', () => {
  expect(permute([3, 4, 5], [2, 1, 0])).toEqual([5, 4, 3])
  expect(permute([3, 4, 5], [2, 0, 1])).toEqual([5, 3, 4])
  expect(permute([3, 4, 5], [0, 1, 2])).toEqual([3, 4, 5])
})

it('permute(array, indexes) does not modify the input array', () => {
  const input = [3, 4, 5]
  permute(input, [2, 1, 0])
  expect(input).toEqual([3, 4, 5])
})

it('permute(array, indexes) can duplicate input values', () => {
  expect(permute([3, 4, 5], [0, 1, 0])).toEqual([3, 4, 3])
  expect(permute([3, 4, 5], [2, 2, 2])).toEqual([5, 5, 5])
  expect(permute([3, 4, 5], [0, 1, 0, 0])).toEqual([3, 4, 3, 3])
})

it('permute(object, keys) returns an array of values in the given key order', () => {
  expect(permute({name: 'Adam', age: 42} as any, ['age', 'name'] as any)).toEqual([42, 'Adam'])
  expect(permute({name: 'Adam', age: 42} as any, ['name', 'age'] as any)).toEqual(['Adam', 42])
})
