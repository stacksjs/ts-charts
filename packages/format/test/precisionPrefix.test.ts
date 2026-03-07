import { describe, expect, test } from 'bun:test'
import { precisionPrefix } from '../src/index.ts'

describe('precisionPrefix', () => {
  test('precisionPrefix(step, value) returns zero if step has the same units as value', () => {
    for (let i = -24; i <= 24; i += 3) {
      for (let j = i; j < i + 3; ++j) {
        expect(precisionPrefix(+('1e' + i), +('1e' + j))).toBe(0)
      }
    }
  })

  test('precisionPrefix(step, value) returns greater than zero if fractional digits are needed', () => {
    for (let i = -24; i <= 24; i += 3) {
      for (let j = i - 4; j < i; ++j) {
        expect(precisionPrefix(+('1e' + j), +('1e' + i))).toBe(i - j)
      }
    }
  })

  test('precisionPrefix(step, value) returns the expected precision when value is less than one yocto', () => {
    expect(precisionPrefix(1e-24, 1e-24)).toBe(0)
    expect(precisionPrefix(1e-25, 1e-25)).toBe(1)
    expect(precisionPrefix(1e-26, 1e-26)).toBe(2)
    expect(precisionPrefix(1e-27, 1e-27)).toBe(3)
    expect(precisionPrefix(1e-28, 1e-28)).toBe(4)
  })

  test('precisionPrefix(step, value) returns the expected precision when value is greater than one yotta', () => {
    expect(precisionPrefix(1e24, 1e24)).toBe(0)
    expect(precisionPrefix(1e24, 1e25)).toBe(0)
    expect(precisionPrefix(1e24, 1e26)).toBe(0)
    expect(precisionPrefix(1e24, 1e27)).toBe(0)
    expect(precisionPrefix(1e23, 1e27)).toBe(1)
  })

  test('precisionPrefix(0, value) returns NaN', () => {
    expect(precisionPrefix(0, 1)).toBeNaN()
  })

  test('precisionPrefix(NaN, value) returns NaN', () => {
    expect(precisionPrefix(NaN, 1)).toBeNaN()
  })

  test('precisionPrefix(Infinity, value) returns NaN', () => {
    expect(precisionPrefix(Infinity, 1)).toBeNaN()
    expect(precisionPrefix(-Infinity, 1)).toBeNaN()
  })
})
