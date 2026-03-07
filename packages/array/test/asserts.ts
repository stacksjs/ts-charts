import { expect } from 'bun:test'
import { InternSet } from '@ts-charts/internmap'

export function assertSetEqual(actual: any, expected: any): void {
  expect(actual instanceof Set).toBe(true)
  expected = new InternSet(expected)
  for (const a of actual) expect(expected.has(a)).toBe(true)
  for (const e of expected) expect(actual.has(e)).toBe(true)
}
