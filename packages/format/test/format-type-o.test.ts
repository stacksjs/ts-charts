import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type o', () => {
  test('format("o") octal', () => {
    expect(format('o')(10)).toBe('12')
  })

  test('format("#o") octal with prefix', () => {
    expect(format('#o')(10)).toBe('0o12')
  })
})
