import { describe, expect, it } from 'bun:test'
import { tickStep } from '../src/index.ts'

it('tickStep(start, stop, count) returns the expected value', () => {
  expect(tickStep(0, 1, 10)).toBe(0.1)
  expect(tickStep(0, 1, 9)).toBe(0.1)
  expect(tickStep(0, 10, 10)).toBe(1)
  expect(tickStep(0, 10, 5)).toBe(2)
  expect(tickStep(-10, 10, 10)).toBe(2)
})

it('tickStep(start, stop, count) returns NaN if any argument is NaN', () => {
  expect(isNaN(tickStep(NaN, 1, 1))).toBe(true)
  expect(isNaN(tickStep(0, NaN, 1))).toBe(true)
  expect(isNaN(tickStep(0, 1, NaN))).toBe(true)
})

it('tickStep(start, stop, count) returns a negative step if start > stop', () => {
  expect(tickStep(10, 0, 10)).toBe(-1)
})
