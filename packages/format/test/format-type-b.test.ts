import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type b', () => {
  test('format("b") binary', () => {
    expect(format('b')(10)).toBe('1010')
  })

  test('format("#b") binary with prefix', () => {
    expect(format('#b')(10)).toBe('0b1010')
  })
})
