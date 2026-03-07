import { expect } from 'bun:test'

export function assertNodeEqual(actual: any, expected: any, delta = 1e-6): void {
  expect(nodeEqual(actual, expected, delta)).toBe(true)
}

function nodeEqual(actual: any, expected: any, delta: number): boolean {
  return actual.index == expected.index
      && Math.abs(actual.x - expected.x) < delta
      && Math.abs(actual.vx - expected.vx) < delta
      && Math.abs(actual.y - expected.y) < delta
      && Math.abs(actual.vy - expected.vy) < delta
      && !(Math.abs(actual.fx - expected.fx) > delta)
      && !(Math.abs(actual.fy - expected.fy) > delta)
}
