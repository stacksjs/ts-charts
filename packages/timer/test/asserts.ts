import { expect } from 'bun:test'

export function assertInRange(actual: number, expectedMin: number, expectedMax: number): void {
  expect(actual).toBeGreaterThanOrEqual(expectedMin)
  expect(actual).toBeLessThanOrEqual(expectedMax)
}
