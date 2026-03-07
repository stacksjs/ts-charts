import { describe, expect, test } from 'bun:test'
import { format, formatLocale } from '../src/index.ts'

describe('format type c', () => {
  test('format("c") unicode character', () => {
    expect(format('c')('\u2603')).toBe('\u2603')
    expect(format('020c')('\u2603')).toBe('0000000000000000000\u2603')
    expect(format(' ^20c')('\u2603')).toBe('         \u2603          ')
    expect(format('$c')('\u2603')).toBe('$\u2603')
  })

  test('format("c") does not localize a decimal point', () => {
    expect(formatLocale({ decimal: '/' }).format('c')('.')).toBe('.')
  })
})
