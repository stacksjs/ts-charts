import { expect } from 'bun:test'
import { Hcl, Hsl, Lab, Rgb } from '../src/index.ts'

export function assertRgbEqual(actual: Rgb, r: number, g: number, b: number, opacity: number): void {
  expect(actual instanceof Rgb).toBe(true)
  if (isNaN(r)) { expect(isNaN(actual.r)).toBe(true) } else { expect(actual.r).toBe(r) }
  if (isNaN(g)) { expect(isNaN(actual.g)).toBe(true) } else { expect(actual.g).toBe(g) }
  if (isNaN(b)) { expect(isNaN(actual.b)).toBe(true) } else { expect(actual.b).toBe(b) }
  if (isNaN(opacity)) { expect(isNaN(actual.opacity)).toBe(true) } else { expect(actual.opacity).toBe(opacity) }
}

export function assertRgbApproxEqual(actual: Rgb, r: number, g: number, b: number, opacity: number): void {
  expect(actual instanceof Rgb).toBe(true)
  if (isNaN(r)) { expect(isNaN(actual.r)).toBe(true) } else { expect(Math.round(actual.r)).toBe(Math.round(r)) }
  if (isNaN(g)) { expect(isNaN(actual.g)).toBe(true) } else { expect(Math.round(actual.g)).toBe(Math.round(g)) }
  if (isNaN(b)) { expect(isNaN(actual.b)).toBe(true) } else { expect(Math.round(actual.b)).toBe(Math.round(b)) }
  if (isNaN(opacity)) { expect(isNaN(actual.opacity)).toBe(true) } else { expect(actual.opacity).toBe(opacity) }
}

export function assertHclEqual(actual: Hcl, h: number, c: number, l: number, opacity: number): void {
  expect(actual instanceof Hcl).toBe(true)
  if (isNaN(h)) { expect(isNaN(actual.h)).toBe(true) } else { expect(Math.abs(actual.h - h)).toBeLessThan(1e-6) }
  if (isNaN(c)) { expect(isNaN(actual.c)).toBe(true) } else { expect(Math.abs(actual.c - c)).toBeLessThan(1e-6) }
  if (isNaN(l)) { expect(isNaN(actual.l)).toBe(true) } else { expect(Math.abs(actual.l - l)).toBeLessThan(1e-6) }
  if (isNaN(opacity)) { expect(isNaN(actual.opacity)).toBe(true) } else { expect(actual.opacity).toBe(opacity) }
}

export function assertHslEqual(actual: Hsl, h: number, s: number, l: number, opacity: number): void {
  expect(actual instanceof Hsl).toBe(true)
  if (isNaN(h)) { expect(isNaN(actual.h)).toBe(true) } else { expect(Math.abs(actual.h - h)).toBeLessThan(1e-6) }
  if (isNaN(s)) { expect(isNaN(actual.s)).toBe(true) } else { expect(Math.abs(actual.s - s)).toBeLessThan(1e-6) }
  if (isNaN(l)) { expect(isNaN(actual.l)).toBe(true) } else { expect(Math.abs(actual.l - l)).toBeLessThan(1e-6) }
  if (isNaN(opacity)) { expect(isNaN(actual.opacity)).toBe(true) } else { expect(actual.opacity).toBe(opacity) }
}

export function assertLabEqual(actual: Lab, l: number, a: number, b: number, opacity: number): void {
  expect(actual instanceof Lab).toBe(true)
  if (isNaN(l)) { expect(isNaN(actual.l)).toBe(true) } else { expect(Math.abs(actual.l - l)).toBeLessThan(1e-6) }
  if (isNaN(a)) { expect(isNaN(actual.a)).toBe(true) } else { expect(Math.abs(actual.a - a)).toBeLessThan(1e-6) }
  if (isNaN(b)) { expect(isNaN(actual.b)).toBe(true) } else { expect(Math.abs(actual.b - b)).toBeLessThan(1e-6) }
  if (isNaN(opacity)) { expect(isNaN(actual.opacity)).toBe(true) } else { expect(actual.opacity).toBe(opacity) }
}
