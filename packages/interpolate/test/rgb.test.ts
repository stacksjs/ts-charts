import { describe, expect, it } from 'bun:test'
import { interpolateRgb } from '../src/index.ts'
import { hsl, rgb } from '@ts-charts/color'

it('interpolateRgb(a, b) converts a and b to RGB colors', () => {
  expect(interpolateRgb('steelblue', 'brown')(0)).toBe(rgb('steelblue') + '')
  expect(interpolateRgb('steelblue', hsl('brown'))(1)).toBe(rgb('brown') + '')
  expect(interpolateRgb('steelblue', rgb('brown'))(1)).toBe(rgb('brown') + '')
})

it('interpolateRgb(a, b) interpolates in RGB and returns an RGB string', () => {
  expect(interpolateRgb('steelblue', '#f00')(0.2)).toBe('rgb(107, 104, 144)')
  expect(interpolateRgb('rgba(70, 130, 180, 1)', 'rgba(255, 0, 0, 0.2)')(0.2)).toBe('rgba(107, 104, 144, 0.84)')
})

it('interpolateRgb(a, b) uses b\'s channel value when a\'s channel value is undefined', () => {
  expect(interpolateRgb(null, rgb(20, 40, 60))(0.5)).toBe(rgb(20, 40, 60) + '')
  expect(interpolateRgb(rgb(NaN, 20, 40), rgb(60, 80, 100))(0.5)).toBe(rgb(60, 50, 70) + '')
  expect(interpolateRgb(rgb(20, NaN, 40), rgb(60, 80, 100))(0.5)).toBe(rgb(40, 80, 70) + '')
  expect(interpolateRgb(rgb(20, 40, NaN), rgb(60, 80, 100))(0.5)).toBe(rgb(40, 60, 100) + '')
})

it('interpolateRgb(a, b) uses a\'s channel value when b\'s channel value is undefined', () => {
  expect(interpolateRgb(rgb(20, 40, 60), null)(0.5)).toBe(rgb(20, 40, 60) + '')
  expect(interpolateRgb(rgb(60, 80, 100), rgb(NaN, 20, 40))(0.5)).toBe(rgb(60, 50, 70) + '')
  expect(interpolateRgb(rgb(60, 80, 100), rgb(20, NaN, 40))(0.5)).toBe(rgb(40, 80, 70) + '')
  expect(interpolateRgb(rgb(60, 80, 100), rgb(20, 40, NaN))(0.5)).toBe(rgb(40, 60, 100) + '')
})

it('interpolateRgb.gamma(3)(a, b) returns the expected values', () => {
  expect(interpolateRgb.gamma(3)('steelblue', '#f00')(0.2)).toBe('rgb(153, 121, 167)')
})

it('interpolateRgb.gamma(3)(a, b) uses linear interpolation for opacity', () => {
  expect(interpolateRgb.gamma(3)('transparent', '#f00')(0.2)).toBe('rgba(255, 0, 0, 0.2)')
})

it('interpolateRgb.gamma(g) coerces the specified gamma to a number', () => {
  expect(interpolateRgb.gamma({ valueOf: function () { return 3 } } as any)('steelblue', '#f00')(0.2)).toBe('rgb(153, 121, 167)')
})

it('interpolateRgb(a, b) is equivalent to interpolateRgb.gamma(1)(a, b)', () => {
  const i0 = interpolateRgb.gamma(1)('purple', 'orange')
  const i1 = interpolateRgb('purple', 'orange')
  expect(i1(0.0)).toBe(i0(0.0))
  expect(i1(0.2)).toBe(i0(0.2))
  expect(i1(0.4)).toBe(i0(0.4))
  expect(i1(0.6)).toBe(i0(0.6))
  expect(i1(0.8)).toBe(i0(0.8))
  expect(i1(1.0)).toBe(i0(1.0))
})
