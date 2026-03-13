import { expect } from 'bun:test'

export function assertInDelta(actual: number, expected: number, delta = 1e-6): void {
  if (Array.isArray(expected)) {
    assertInDeltaArray(actual as any, expected as any, delta)
  // eslint-disable-next-line pickier/no-unused-vars
  } else if (typeof expected === 'object' && expected !== null) {
    assertInDeltaObject(actual as any, expected as any, delta)
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    expect(Math.abs((actual as number) - (expected as number))).toBeLessThan(delta)
  }
}

function assertInDeltaArray(actual: number[], expected: number[], delta: number): void {
  expect(actual.length).toBe(expected.length)
  for (let i = 0; i < expected.length; i++) {
    assertInDelta(actual[i], expected[i], delta)
  }
}

function assertInDeltaObject(actual: any, expected: any, delta: number): void {
  for (const key in expected) {
    assertInDelta(actual[key], expected[key], delta)
  }
  for (const key in actual) {
    expect(key in expected).toBe(true)
  }
}

export function roundEpsilon(x: number): number {
  return Math.round(x * 1e12) / 1e12
}

export function local(year?: number, month?: number, day?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): Date {
  if (year == null) year = 0
  if (month == null) month = 0
  if (day == null) day = 1
  if (hours == null) hours = 0
  if (minutes == null) minutes = 0
  if (seconds == null) seconds = 0
  if (milliseconds == null) milliseconds = 0
  if (0 <= year && year < 100) {
    const date = new Date(-1, month, day, hours, minutes, seconds, milliseconds)
    date.setFullYear(year)
    return date
  }
  return new Date(year, month, day, hours, minutes, seconds, milliseconds)
}

export function utc(year?: number, month?: number, day?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): Date {
  if (year == null) year = 0
  if (month == null) month = 0
  if (day == null) day = 1
  if (hours == null) hours = 0
  if (minutes == null) minutes = 0
  if (seconds == null) seconds = 0
  if (milliseconds == null) milliseconds = 0
  if (0 <= year && year < 100) {
    const date = new Date(Date.UTC(-1, month, day, hours, minutes, seconds, milliseconds))
    date.setUTCFullYear(year)
    return date
  }
  return new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds))
}
