import { expect } from 'bun:test'

export function assertInDelta(actual: any, expected: any, delta: number = 1e-6): void {
  expect(inDelta(actual, expected, delta)).toBe(true)
}

function inDelta(actual: any, expected: any, delta: number): boolean {
  return (Array.isArray(expected) ? inDeltaArray
    : typeof expected === 'object' ? inDeltaObject
      : inDeltaNumber)(actual, expected, delta)
}

function inDeltaArray(actual: any[], expected: any[], delta: number): boolean {
  const n = expected.length
  let i = -1
  if (actual.length !== n) return false
  while (++i < n) if (!inDelta(actual[i], expected[i], delta)) return false
  return true
}

function inDeltaObject(actual: Record<string, any>, expected: Record<string, any>, delta: number): boolean {
  for (const i in expected) if (!inDelta(actual[i], expected[i], delta)) return false
  for (const i in actual) if (!(i in expected)) return false
  return true
}

function inDeltaNumber(actual: number, expected: number, delta: number): boolean {
  return actual >= expected - delta && actual <= expected + delta
}
