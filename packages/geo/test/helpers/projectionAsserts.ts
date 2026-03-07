import { expect } from 'bun:test'

export function assertProjectionEqual(projection: any, location: number[], point: number[], delta?: number): void {
  expect(
    planarEqual(projection(location), point, delta || 1e-6)
    && sphericalEqual(projection.invert(point), location, delta || 1e-3)
  ).toBe(true)
}

function planarEqual(actual: number[], expected: number[], delta: number): boolean {
  return Array.isArray(actual)
    && actual.length === 2
    && inDelta(actual[0], expected[0], delta)
    && inDelta(actual[1], expected[1], delta)
}

function sphericalEqual(actual: number[], expected: number[], delta: number): boolean {
  return Array.isArray(actual)
    && actual.length === 2
    && longitudeEqual(actual[0], expected[0], delta)
    && inDelta(actual[1], expected[1], delta)
}

function longitudeEqual(actual: number, expected: number, delta: number): boolean {
  actual = Math.abs(actual - expected) % 360
  return actual <= delta || actual >= 360 - delta
}

function inDelta(actual: number, expected: number, delta: number): boolean {
  return Math.abs(actual - expected) <= delta
}
