import { describe, it, expect } from 'bun:test'
import { area, line, curveBumpY } from '../../src/index.ts'
import { assertPathEqual } from '../asserts.ts'

it('line.curve(curveBumpY)(data) generates the expected path', () => {
  const l = line().curve(curveBumpY)
  expect(l([])).toBeNull()
  assertPathEqual(l([[0, 1]]), 'M0,1Z')
  assertPathEqual(l([[0, 1], [1, 3]]), 'M0,1C0,2,1,2,1,3')
  assertPathEqual(l([[0, 1], [1, 3], [2, 1]]), 'M0,1C0,2,1,2,1,3C1,2,2,2,2,1')
})

it('area.curve(curveBumpY)(data) generates the expected path', () => {
  const a = area().curve(curveBumpY)
  expect(a([])).toBeNull()
  assertPathEqual(a([[0, 1]]), 'M0,1L0,0Z')
  assertPathEqual(a([[0, 1], [1, 3]]), 'M0,1C0,2,1,2,1,3L1,0C1,0,0,0,0,0Z')
  assertPathEqual(a([[0, 1], [1, 3], [2, 1]]), 'M0,1C0,2,1,2,1,3C1,2,2,2,2,1L2,0C2,0,1,0,1,0C1,0,0,0,0,0Z')
})
