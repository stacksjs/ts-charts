import { describe, expect, it } from 'bun:test'
import { interpolateNumber, interpolateRgb, quantize } from '../src/index.ts'

it('quantize(interpolate, n) returns n uniformly-spaced samples from the specified interpolator', () => {
  expect(quantize(interpolateNumber(0, 1), 5)).toEqual([
    0 / 4,
    1 / 4,
    2 / 4,
    3 / 4,
    4 / 4,
  ])
  expect(quantize(interpolateRgb('steelblue', 'brown'), 5)).toEqual([
    'rgb(70, 130, 180)',
    'rgb(94, 108, 146)',
    'rgb(118, 86, 111)',
    'rgb(141, 64, 77)',
    'rgb(165, 42, 42)',
  ])
})
