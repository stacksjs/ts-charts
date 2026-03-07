import { describe, expect, test } from 'bun:test'
import { precisionRound } from '../src/index.ts'

describe('precisionRound', () => {
  test('precisionRound(step, max) returns the expected value', () => {
    expect(precisionRound(0.1, 1.1)).toBe(2)
    expect(precisionRound(0.01, 0.99)).toBe(2)
    expect(precisionRound(0.01, 1.00)).toBe(2)
    expect(precisionRound(0.01, 1.01)).toBe(3)
  })

  test('precisionRound(0, max) returns NaN', () => {
    expect(precisionRound(0, 1)).toBeNaN()
  })

  test('precisionRound(NaN, max) returns NaN', () => {
    expect(precisionRound(NaN, 1)).toBeNaN()
  })

  test('precisionRound(Infinity, max) returns NaN', () => {
    expect(precisionRound(Infinity, 1)).toBeNaN()
    expect(precisionRound(-Infinity, 1)).toBeNaN()
  })
})
