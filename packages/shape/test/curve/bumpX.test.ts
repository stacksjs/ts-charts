import { describe, it, expect } from 'bun:test'
import { area, line, curveBumpX } from '../../src/index.ts'
import { assertPathEqual } from '../asserts.ts'

it('line.curve(curveBumpX)(data) generates the expected path', () => {
  const l = line().curve(curveBumpX)
  expect(l([])).toBeNull()
  assertPathEqual(l([[0, 1]]), 'M0,1Z')
  assertPathEqual(l([[0, 1], [1, 3]]), 'M0,1C0.500000,1,0.500000,3,1,3')
  assertPathEqual(l([[0, 1], [1, 3], [2, 1]]), 'M0,1C0.500000,1,0.500000,3,1,3C1.500000,3,1.500000,1,2,1')
})

it('area.curve(curveBumpX)(data) generates the expected path', () => {
  const a = area().curve(curveBumpX)
  expect(a([])).toBeNull()
  assertPathEqual(a([[0, 1]]), 'M0,1L0,0Z')
  assertPathEqual(a([[0, 1], [1, 3]]), 'M0,1C0.500000,1,0.500000,3,1,3L1,0C0.500000,0,0.500000,0,0,0Z')
  assertPathEqual(a([[0, 1], [1, 3], [2, 1]]), 'M0,1C0.500000,1,0.500000,3,1,3C1.500000,3,1.500000,1,2,1L2,0C1.500000,0,1.500000,0,1,0C0.500000,0,0.500000,0,0,0Z')
})
