import { describe, expect, it } from 'bun:test'
import { quantile, quantileSorted } from '../src/index.ts'

it('quantile(array, p) requires sorted numeric input, returns the p-quantile', () => {
  expect(quantile([0], 0)).toBe(0)
  expect(quantile([0], 1)).toBe(0)
  expect(quantile([0, 10], 0)).toBe(0)
  expect(quantile([0, 10], 1)).toBe(10)
  expect(quantile([0, 10], 0.5)).toBe(5)
})

it('quantile(array, p) returns undefined for empty arrays', () => {
  expect(quantile([], 0)).toBe(undefined)
  expect(quantile([], 0.5)).toBe(undefined)
  expect(quantile([], 1)).toBe(undefined)
})

it('quantile(array, p) returns undefined for NaN p', () => {
  expect(quantile([0, 10, 20], NaN)).toBe(undefined)
})

it('quantile(array, p) coerces values to numbers', () => {
  expect(quantile(['0', '10', '20'], 0.5)).toBe(10)
})

it('quantileSorted(array, p) requires sorted input, returns the p-quantile', () => {
  expect(quantileSorted([0], 0)).toBe(0)
  expect(quantileSorted([0], 1)).toBe(0)
  expect(quantileSorted([0, 10], 0)).toBe(0)
  expect(quantileSorted([0, 10], 1)).toBe(10)
  expect(quantileSorted([0, 10], 0.5)).toBe(5)
  expect(quantileSorted([0, 10, 20], 0)).toBe(0)
  expect(quantileSorted([0, 10, 20], 0.5)).toBe(10)
  expect(quantileSorted([0, 10, 20], 1)).toBe(20)
  expect(quantileSorted([0, 10, 20], 0.25)).toBe(5)
  expect(quantileSorted([0, 10, 20], 0.75)).toBe(15)
})
