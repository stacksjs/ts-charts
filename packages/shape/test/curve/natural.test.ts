import { describe, it, expect } from 'bun:test'
import { area, line, curveNatural } from '../../src/index.ts'
import { assertPathEqual } from '../asserts.ts'

it('line.curve(curveNatural)(data) generates the expected path', () => {
  const l = line().curve(curveNatural)
  expect(l([])).toBeNull()
  assertPathEqual(l([[0, 1]]), 'M0,1Z')
  assertPathEqual(l([[0, 1], [1, 3]]), 'M0,1L1,3')
  assertPathEqual(l([[0, 1], [1, 3], [2, 1]]), 'M0,1C0.333333,2,0.666667,3,1,3C1.333333,3,1.666667,2,2,1')
  assertPathEqual(l([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M0,1C0.333333,2.111111,0.666667,3.222222,1,3C1.333333,2.777778,1.666667,1.222222,2,1C2.333333,0.777778,2.666667,1.888889,3,3')
})

it('area.curve(curveNatural)(data) generates the expected path', () => {
  const a = area().curve(curveNatural)
  expect(a([])).toBeNull()
  assertPathEqual(a([[0, 1]]), 'M0,1L0,0Z')
  assertPathEqual(a([[0, 1], [1, 3]]), 'M0,1L1,3L1,0L0,0Z')
  assertPathEqual(a([[0, 1], [1, 3], [2, 1]]), 'M0,1C0.333333,2,0.666667,3,1,3C1.333333,3,1.666667,2,2,1L2,0C1.666667,0,1.333333,0,1,0C0.666667,0,0.333333,0,0,0Z')
  assertPathEqual(a([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M0,1C0.333333,2.111111,0.666667,3.222222,1,3C1.333333,2.777778,1.666667,1.222222,2,1C2.333333,0.777778,2.666667,1.888889,3,3L3,0C2.666667,0,2.333333,0,2,0C1.666667,0,1.333333,0,1,0C0.666667,0,0.333333,0,0,0Z')
})
