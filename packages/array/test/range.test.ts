import { describe, expect, it } from 'bun:test'
import { range } from '../src/index.ts'

it('range(stop) returns [0, 1, 2, ... stop - 1]', () => {
  expect(range(5)).toEqual([0, 1, 2, 3, 4])
  expect(range(2.01)).toEqual([0, 1, 2])
  expect(range(1)).toEqual([0])
  expect(range(.5)).toEqual([0])
})

it('range(stop) returns an empty array if stop <= 0', () => {
  expect(range(0)).toEqual([])
  expect(range(-5)).toEqual([])
  expect(range(NaN)).toEqual([])
})

it('range(start, stop) returns [start, start + 1, ... stop - 1]', () => {
  expect(range(0, 5)).toEqual([0, 1, 2, 3, 4])
  expect(range(2, 5)).toEqual([2, 3, 4])
  expect(range(2.5, 5)).toEqual([2.5, 3.5, 4.5])
  expect(range(-1, 3)).toEqual([-1, 0, 1, 2])
})

it('range(start, stop) returns an empty array if start >= stop', () => {
  expect(range(0, 0)).toEqual([])
  expect(range(5, 5)).toEqual([])
  expect(range(6, 5)).toEqual([])
  expect(range(10, 10)).toEqual([])
  expect(range(20, 10)).toEqual([])
})

it('range(start, stop, step) returns [start, start + step, start + 2 * step, ...]', () => {
  expect(range(0, 5, 1)).toEqual([0, 1, 2, 3, 4])
  expect(range(0, 5, 2)).toEqual([0, 2, 4])
  expect(range(2, 5, 2)).toEqual([2, 4])
  expect(range(-1, 3, 2)).toEqual([-1, 1])
})

it('range(start, stop, step) allows a negative step', () => {
  expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1])
  expect(range(5, 0, -2)).toEqual([5, 3, 1])
  expect(range(5, 2, -2)).toEqual([5, 3])
})

it('range(start, stop, step) returns an empty array if step is zero', () => {
  expect(range(0, 5, 0)).toEqual([])
})
