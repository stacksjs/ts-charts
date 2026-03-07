import { describe, it, expect } from 'bun:test'
import { area, line, curveStepBefore } from '../../src/index.ts'
import { assertPathEqual } from '../asserts.ts'

it('line.curve(curveStepBefore)(data) generates the expected path', () => {
  const l = line().curve(curveStepBefore)
  expect(l([])).toBeNull()
  assertPathEqual(l([[0, 1]]), 'M0,1Z')
  assertPathEqual(l([[0, 1], [2, 3]]), 'M0,1L0,3L2,3')
  assertPathEqual(l([[0, 1], [2, 3], [4, 5]]), 'M0,1L0,3L2,3L2,5L4,5')
})

it('area.curve(curveStepBefore)(data) generates the expected path', () => {
  const a = area().curve(curveStepBefore)
  expect(a([])).toBeNull()
  assertPathEqual(a([[0, 1]]), 'M0,1L0,0Z')
  assertPathEqual(a([[0, 1], [2, 3]]), 'M0,1L0,3L2,3L2,0L0,0L0,0Z')
  assertPathEqual(a([[0, 1], [2, 3], [4, 5]]), 'M0,1L0,3L2,3L2,5L4,5L4,0L2,0L2,0L0,0L0,0Z')
})
