import { describe, expect, it } from 'bun:test'
import { interpolateZoom } from '../src/index.ts'

it('interpolateZoom(a, b) handles nearly-coincident points', () => {
  expect(interpolateZoom([324.68721096803614, 59.43501602433761, 1.8827137399562621], [324.6872108946794, 59.43501601062763, 7.399052110984391])(0.5)).toEqual([324.68721093135775, 59.43501601748262, 3.7323313186268305])
})

it('interpolateZoom returns the expected duration', () => {
  expect(Math.abs(interpolateZoom([0, 0, 1], [0, 0, 1.1]).duration - 67)).toBeLessThan(1)
  expect(Math.abs(interpolateZoom([0, 0, 1], [0, 0, 2]).duration - 490)).toBeLessThan(1)
  expect(Math.abs(interpolateZoom([0, 0, 1], [10, 0, 8]).duration - 2872.5)).toBeLessThan(1)
})

it('interpolateZoom parameter rho() defaults to sqrt(2)', () => {
  const a = interpolateZoom([0, 0, 1], [10, 10, 5])(0.5)
  const b = interpolateZoom.rho(Math.sqrt(2))([0, 0, 1], [10, 10, 5])(0.5)
  expect(Math.abs(a[0] - b[0])).toBeLessThan(1e-6)
  expect(Math.abs(a[1] - b[1])).toBeLessThan(1e-6)
  expect(Math.abs(a[2] - b[2])).toBeLessThan(1e-6)
})

it('interpolateZoom.rho(0) is (almost) linear', () => {
  const interp = interpolateZoom.rho(0)([0, 0, 1], [10, 0, 8])
  const result = interp(0.5)
  expect(Math.abs(result[0] - 1.111)).toBeLessThan(1e-3)
  expect(Math.abs(result[1] - 0)).toBeLessThan(1e-3)
  expect(Math.abs(result[2] - Math.sqrt(8))).toBeLessThan(1e-3)
  expect(Math.round(interp.duration)).toBe(1470)
})

it('interpolateZoom parameter rho(2) has a high curvature and takes more time', () => {
  const interp = interpolateZoom.rho(2)([0, 0, 1], [10, 0, 8])
  const result = interp(0.5)
  expect(Math.abs(result[0] - 1.111)).toBeLessThan(1e-3)
  expect(Math.abs(result[1] - 0)).toBeLessThan(1e-3)
  expect(Math.abs(result[2] - 12.885)).toBeLessThan(1e-3)
  expect(Math.round(interp.duration)).toBe(3775)
})
