import { describe, expect, test } from 'bun:test'
import { precisionFixed } from '../src/index.ts'

describe('precisionFixed', () => {
  test('precisionFixed(number) returns the expected value', () => {
    expect(precisionFixed(8.9)).toBe(0)
    expect(precisionFixed(1.1)).toBe(0)
    expect(precisionFixed(0.89)).toBe(1)
    expect(precisionFixed(0.11)).toBe(1)
    expect(precisionFixed(0.089)).toBe(2)
    expect(precisionFixed(0.011)).toBe(2)
  })

  test('precisionFixed(0) returns NaN', () => {
    expect(precisionFixed(0)).toBeNaN()
  })

  test('precisionFixed(NaN) returns NaN', () => {
    expect(precisionFixed(NaN)).toBeNaN()
  })

  test('precisionFixed(Infinity) returns NaN', () => {
    expect(precisionFixed(Infinity)).toBeNaN()
    expect(precisionFixed(-Infinity)).toBeNaN()
  })
})
