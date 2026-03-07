import { describe, expect, it } from 'bun:test'
import { hcl, rgb } from '@ts-charts/color'
import { interpolateHcl } from '../src/index.ts'

it('interpolateHcl(a, b) converts a and b to HCL colors', () => {
  expect(interpolateHcl('steelblue', 'brown')(0)).toBe(rgb('steelblue') + '')
  expect(interpolateHcl('steelblue', hcl('brown'))(1)).toBe(rgb('brown') + '')
  expect(interpolateHcl('steelblue', rgb('brown'))(1)).toBe(rgb('brown') + '')
})

it('interpolateHcl(a, b) interpolates in HCL and returns an RGB string', () => {
  expect(interpolateHcl('steelblue', '#f00')(0.2)).toBe('rgb(106, 121, 206)')
  expect(interpolateHcl('rgba(70, 130, 180, 1)', 'rgba(255, 0, 0, 0.2)')(0.2)).toBe('rgba(106, 121, 206, 0.84)')
})

it('interpolateHcl(a, b) uses the shortest path when interpolating hue difference greater than 180 degrees', () => {
  const i = interpolateHcl(hcl(10, 50, 50), hcl(350, 50, 50))
  expect(i(0.0)).toBe('rgb(194, 78, 107)')
  expect(i(0.2)).toBe('rgb(194, 78, 113)')
  expect(i(0.4)).toBe('rgb(193, 78, 118)')
  expect(i(0.6)).toBe('rgb(192, 78, 124)')
  expect(i(0.8)).toBe('rgb(191, 78, 130)')
  expect(i(1.0)).toBe('rgb(189, 79, 136)')
})

it('interpolateHcl(a, b) uses the shortest path when interpolating hue difference greater than 360 degrees', () => {
  const i = interpolateHcl(hcl(10, 50, 50), hcl(380, 50, 50))
  expect(i(0.0)).toBe('rgb(194, 78, 107)')
  expect(i(0.2)).toBe('rgb(194, 78, 104)')
  expect(i(0.4)).toBe('rgb(194, 79, 101)')
  expect(i(0.6)).toBe('rgb(194, 79, 98)')
  expect(i(0.8)).toBe('rgb(194, 80, 96)')
  expect(i(1.0)).toBe('rgb(194, 80, 93)')
})

it('interpolateHcl(a, b) uses the shortest path when interpolating hue difference greater than 540 degrees', () => {
  const i = interpolateHcl(hcl(10, 50, 50), hcl(710, 50, 50))
  expect(i(0.0)).toBe('rgb(194, 78, 107)')
  expect(i(0.2)).toBe('rgb(194, 78, 113)')
  expect(i(0.4)).toBe('rgb(193, 78, 118)')
  expect(i(0.6)).toBe('rgb(192, 78, 124)')
  expect(i(0.8)).toBe('rgb(191, 78, 130)')
  expect(i(1.0)).toBe('rgb(189, 79, 136)')
})

it('interpolateHcl(a, b) uses the shortest path when interpolating hue difference greater than 720 degrees', () => {
  const i = interpolateHcl(hcl(10, 50, 50), hcl(740, 50, 50))
  expect(i(0.0)).toBe('rgb(194, 78, 107)')
  expect(i(0.2)).toBe('rgb(194, 78, 104)')
  expect(i(0.4)).toBe('rgb(194, 79, 101)')
  expect(i(0.6)).toBe('rgb(194, 79, 98)')
  expect(i(0.8)).toBe('rgb(194, 80, 96)')
  expect(i(1.0)).toBe('rgb(194, 80, 93)')
})

it('interpolateHcl(a, b) uses a\'s hue when b\'s hue is undefined', () => {
  expect(interpolateHcl('#f60', hcl(NaN, NaN, 0))(0.5)).toBe('rgb(155, 0, 0)')
  expect(interpolateHcl('#6f0', hcl(NaN, NaN, 0))(0.5)).toBe('rgb(0, 129, 0)')
})

it('interpolateHcl(a, b) uses b\'s hue when a\'s hue is undefined', () => {
  expect(interpolateHcl(hcl(NaN, NaN, 0), '#f60')(0.5)).toBe('rgb(155, 0, 0)')
  expect(interpolateHcl(hcl(NaN, NaN, 0), '#6f0')(0.5)).toBe('rgb(0, 129, 0)')
})

it('interpolateHcl(a, b) uses a\'s chroma when b\'s chroma is undefined', () => {
  expect(interpolateHcl('#ccc', hcl(NaN, NaN, 0))(0.5)).toBe('rgb(97, 97, 97)')
  expect(interpolateHcl('#f00', hcl(NaN, NaN, 0))(0.5)).toBe('rgb(166, 0, 0)')
})

it('interpolateHcl(a, b) uses b\'s chroma when a\'s chroma is undefined', () => {
  expect(interpolateHcl(hcl(NaN, NaN, 0), '#ccc')(0.5)).toBe('rgb(97, 97, 97)')
  expect(interpolateHcl(hcl(NaN, NaN, 0), '#f00')(0.5)).toBe('rgb(166, 0, 0)')
})

it('interpolateHcl(a, b) uses b\'s luminance when a\'s luminance is undefined', () => {
  expect(interpolateHcl(null, hcl(20, 80, 50))(0.5)).toBe('rgb(230, 13, 79)')
})

it('interpolateHcl(a, b) uses a\'s luminance when b\'s luminance is undefined', () => {
  expect(interpolateHcl(hcl(20, 80, 50), null)(0.5)).toBe('rgb(230, 13, 79)')
})
