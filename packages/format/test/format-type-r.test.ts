import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type r', () => {
  test('format("r") can round to significant digits', () => {
    expect(format('.1r')(0.049)).toBe('0.05')
    expect(format('.1r')(-0.049)).toBe('\u22120.05')
    expect(format('.1r')(0.49)).toBe('0.5')
    expect(format('.1r')(-0.49)).toBe('\u22120.5')
    expect(format('.2r')(0.449)).toBe('0.45')
    expect(format('.3r')(0.4449)).toBe('0.445')
    expect(format('.3r')(1.00)).toBe('1.00')
    expect(format('.3r')(0.9995)).toBe('1.00')
    expect(format('.5r')(0.444449)).toBe('0.44445')
    expect(format('r')(123.45)).toBe('123.450')
    expect(format('.1r')(123.45)).toBe('100')
    expect(format('.2r')(123.45)).toBe('120')
    expect(format('.3r')(123.45)).toBe('123')
    expect(format('.4r')(123.45)).toBe('123.5')
    expect(format('.5r')(123.45)).toBe('123.45')
    expect(format('.6r')(123.45)).toBe('123.450')
    expect(format('.1r')(.9)).toBe('0.9')
    expect(format('.1r')(.09)).toBe('0.09')
    expect(format('.1r')(.949)).toBe('0.9')
    expect(format('.1r')(.0949)).toBe('0.09')
    expect(format('.1r')(.0000000129)).toBe('0.00000001')
    expect(format('.2r')(.0000000129)).toBe('0.000000013')
    expect(format('.2r')(.00000000129)).toBe('0.0000000013')
    expect(format('.3r')(.00000000129)).toBe('0.00000000129')
    expect(format('.4r')(.00000000129)).toBe('0.000000001290')
    expect(format('.10r')(.9999999999)).toBe('0.9999999999')
    expect(format('.15r')(.999999999999999)).toBe('0.999999999999999')
  })

  test('format("r") can round zero', () => {
    expect(format('.2r')(0)).toBe('0')
    expect(format('.1r')(0)).toBe('0')
    expect(format('r')(0)).toBe('0')
  })

  test('format("r") can round very small numbers', () => {
    const f = format('.2r')
    expect(f(1e-22)).toBe('0.00000000000000000000010')
  })
})
