import { describe, it, expect } from 'bun:test'
import { curveLinear, lineRadial } from '../src/index.ts'
import { assertPathEqual } from './asserts.ts'

it('lineRadial() returns a default radial line shape', () => {
  const l = lineRadial()
  expect(l.angle()([42, 34])).toBe(42)
  expect(l.radius()([42, 34])).toBe(34)
  expect(l.defined()([42, 34])).toBe(true)
  expect(l.curve()).toBe(curveLinear)
  expect(l.context()).toBeNull()
  assertPathEqual(l([[0, 1], [2, 3], [4, 5]]), 'M0,-1L2.727892,1.248441L-3.784012,3.268218')
})
