import { describe, expect, it } from 'bun:test'
import { cross } from '../src/index.ts'

it('cross() returns an empty array', () => {
  expect(cross()).toEqual([])
})

it('cross([]) returns an empty array', () => {
  expect(cross([])).toEqual([])
})

it('cross([1, 2], []) returns an empty array', () => {
  expect(cross([1, 2], [])).toEqual([])
})

it('cross({length: weird}) returns an empty array', () => {
  expect(cross({length: NaN})).toEqual([])
  expect(cross({length: 0.5})).toEqual([])
  expect(cross({length: -1})).toEqual([])
  expect(cross({length: undefined})).toEqual([])
})

it('cross(...strings) returns the expected result', () => {
  expect(cross('foo', 'bar', (a: any, b: any) => a + b)).toEqual(['fb', 'fa', 'fr', 'ob', 'oa', 'or', 'ob', 'oa', 'or'])
})

it('cross(a) returns the expected result', () => {
  expect(cross([1, 2])).toEqual([[1], [2]])
})

it('cross(a, b) returns Cartesian product a x b', () => {
  expect(cross([1, 2], ['x', 'y'])).toEqual([[1, 'x'], [1, 'y'], [2, 'x'], [2, 'y']])
})

it('cross(a, b, c) returns Cartesian product a x b x c', () => {
  expect(cross([1, 2], [3, 4], [5, 6, 7])).toEqual([
    [1, 3, 5], [1, 3, 6], [1, 3, 7],
    [1, 4, 5], [1, 4, 6], [1, 4, 7],
    [2, 3, 5], [2, 3, 6], [2, 3, 7],
    [2, 4, 5], [2, 4, 6], [2, 4, 7]
  ])
})

it('cross(a, b, f) invokes the specified function for each pair', () => {
  expect(cross([1, 2], ['x', 'y'], (a: any, b: any) => a + b)).toEqual(['1x', '1y', '2x', '2y'])
})
