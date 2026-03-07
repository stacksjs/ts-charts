import { expect } from 'bun:test'

export function assertPathEqual(actual: string, expected: string) {
  expect(normalizePath(actual + '')).toBe(normalizePath(expected + ''))
}

const reNumber = /[-+]?(?:\d+\.\d+|\d+\.|\.\d+|\d+)(?:[eE][-]?\d+)?/g

function normalizePath(path: string): string {
  return path.replace(reNumber, formatNumber)
}

function formatNumber(s: string): string {
  const n = +s
  return Math.abs(n - Math.round(n)) < 1e-6 ? String(Math.round(n)) : n.toFixed(3)
}

export function assertInDelta(actual: any, expected: any, delta = 1e-6) {
  expect(inDelta(actual, expected, delta)).toBe(true)
}

function inDelta(actual: any, expected: any, delta: number): boolean {
  return (Array.isArray(expected) ? inDeltaArray
    : typeof expected === 'object' ? inDeltaObject
    : inDeltaNumber)(actual, expected, delta)
}

function inDeltaArray(actual: any[], expected: any[], delta: number): boolean {
  let n = expected.length, i = -1
  if (actual.length !== n) return false
  while (++i < n) if (!inDelta(actual[i], expected[i], delta)) return false
  return true
}

function inDeltaObject(actual: any, expected: any, delta: number): boolean {
  for (const i in expected) if (!inDelta(actual[i], expected[i], delta)) return false
  for (const i in actual) if (!(i in expected)) return false
  return true
}

function inDeltaNumber(actual: number, expected: number, delta: number): boolean {
  return actual >= expected - delta && actual <= expected + delta
}
