import { describe, expect, it } from 'bun:test'
import { merge } from '../src/index.ts'

it('merge(arrays) merges an array of arrays', () => {
  const a = {}, b = {}, c = {}, d = {}, e = {}, f = {}
  expect(merge([[a], [b, c], [d, e, f]])).toEqual([a, b, c, d, e, f])
})

it('merge(arrays) returns a new array when zero arrays are passed', () => {
  const input: any[] = []
  const output = merge(input)
  expect(output).toEqual([])
  input.push([0.1])
  expect(input).toEqual([[0.1]])
  expect(output).toEqual([])
})

it('merge(arrays) returns a new array when one array is passed', () => {
  const input = [[1, 2, 3]]
  const output = merge(input)
  expect(output).toEqual([1, 2, 3])
  input.push([4.1])
  input[0].push(3.1)
  expect(input).toEqual([[1, 2, 3, 3.1], [4.1]])
  expect(output).toEqual([1, 2, 3])
})

it('merge(arrays) returns a new array when two or more arrays are passed', () => {
  const input = [[1, 2, 3], [4, 5], [6]]
  const output = merge(input)
  expect(output).toEqual([1, 2, 3, 4, 5, 6])
})

it('merge(arrays) does not modify the input arrays', () => {
  const input = [[1, 2, 3], [4, 5], [6]]
  merge(input)
  expect(input).toEqual([[1, 2, 3], [4, 5], [6]])
})
