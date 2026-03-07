import { describe, expect, it } from 'bun:test'
import { ticks } from '../src/index.ts'

it('ticks(start, stop, count) returns the expected ticks for a given start, stop and count', () => {
  expect(ticks(  0,   1,  10)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
  expect(ticks(  0,   1,   9)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
  expect(ticks(  0,   1,   8)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
  expect(ticks(  0,   1,   7)).toEqual([0.0,      0.2,      0.4,      0.6,      0.8,      1.0])
  expect(ticks(  0,   1,   6)).toEqual([0.0,      0.2,      0.4,      0.6,      0.8,      1.0])
  expect(ticks(  0,   1,   5)).toEqual([0.0,      0.2,      0.4,      0.6,      0.8,      1.0])
  expect(ticks(  0,   1,   4)).toEqual([0.0,      0.2,      0.4,      0.6,      0.8,      1.0])
  expect(ticks(  0,   1,   3)).toEqual([0.0,                0.5,                           1.0])
  expect(ticks(  0,   1,   2)).toEqual([0.0,                0.5,                           1.0])
  expect(ticks(  0,   1,   1)).toEqual([0.0,                                               1.0])
  expect(ticks(  0,  10,  10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  expect(ticks(  0,  10,   9)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  expect(ticks(  0,  10,   8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  expect(ticks(  0,  10,   7)).toEqual([0,    2,    4,    6,    8,    10])
  expect(ticks(  0,  10,   6)).toEqual([0,    2,    4,    6,    8,    10])
  expect(ticks(  0,  10,   5)).toEqual([0,    2,    4,    6,    8,    10])
  expect(ticks(  0,  10,   4)).toEqual([0,    2,    4,    6,    8,    10])
  expect(ticks(  0,  10,   3)).toEqual([0,             5,             10])
  expect(ticks(  0,  10,   2)).toEqual([0,             5,             10])
  expect(ticks(  0,  10,   1)).toEqual([0,                            10])
  expect(ticks(-10,  10,  10)).toEqual([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10])
  expect(ticks(-10,  10,   9)).toEqual([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10])
  expect(ticks(-10,  10,   8)).toEqual([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10])
  expect(ticks(-10,  10,   7)).toEqual([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10])
  expect(ticks(-10,  10,   6)).toEqual([-10,         -5,      0,      5,     10])
  expect(ticks(-10,  10,   5)).toEqual([-10,         -5,      0,      5,     10])
  expect(ticks(-10,  10,   4)).toEqual([-10,         -5,      0,      5,     10])
  expect(ticks(-10,  10,   3)).toEqual([-10,         -5,      0,      5,     10])
  expect(ticks(-10,  10,   2)).toEqual([-10,                  0,             10])
  expect(ticks(-10,  10,   1)).toEqual([                      0                ])
})

it('ticks(start, stop, count) returns the empty array if count is not positive', () => {
  expect(ticks(0, 1, 0)).toEqual([])
  expect(ticks(0, 1, -1)).toEqual([])
  expect(ticks(0, 1, NaN)).toEqual([])
})

it('ticks(start, stop, count) returns the empty array if start or stop is NaN', () => {
  expect(ticks(NaN, 1, 1)).toEqual([])
  expect(ticks(0, NaN, 1)).toEqual([])
  expect(ticks(NaN, NaN, 1)).toEqual([])
})

it('ticks(start, stop, count) returns the start value if start === stop', () => {
  expect(ticks(1, 1, 1)).toEqual([1])
  expect(ticks(1, 1, 10)).toEqual([1])
})

it('ticks(start, stop, count) returns reversed ticks if start > stop', () => {
  expect(ticks(1, 0, 5)).toEqual([1.0, 0.8, 0.6, 0.4, 0.2, 0.0])
  expect(ticks(10, 0, 5)).toEqual([10, 8, 6, 4, 2, 0])
})
