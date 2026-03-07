import { describe, it, expect } from 'bun:test'
import { area, line, curveBasisOpen } from '../../src/index.ts'
import { assertPathEqual } from '../asserts.ts'

it('line.curve(curveBasisOpen)(data) generates the expected path', () => {
  const l = line().curve(curveBasisOpen)
  expect(l([])).toBeNull()
  expect(l([[0, 0]])).toBeNull()
  expect(l([[0, 0], [0, 10]])).toBeNull()
  assertPathEqual(l([[0, 0], [0, 10], [10, 10]]), 'M1.666667,8.333333Z')
  assertPathEqual(l([[0, 0], [0, 10], [10, 10], [10, 0]]), 'M1.666667,8.333333C3.333333,10,6.666667,10,8.333333,8.333333')
  assertPathEqual(l([[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]), 'M1.666667,8.333333C3.333333,10,6.666667,10,8.333333,8.333333C10,6.666667,10,3.333333,8.333333,1.666667')
})

it('area.curve(curveBasisOpen)(data) generates the expected path', () => {
  const a = area().curve(curveBasisOpen)
  expect(a([])).toBeNull()
  expect(a([[0, 1]])).toBeNull()
  expect(a([[0, 1], [1, 3]])).toBeNull()
  assertPathEqual(a([[0, 0], [0, 10], [10, 10]]), 'M1.666667,8.333333L1.666667,0Z')
  assertPathEqual(a([[0, 0], [0, 10], [10, 10], [10, 0]]), 'M1.666667,8.333333C3.333333,10,6.666667,10,8.333333,8.333333L8.333333,0C6.666667,0,3.333333,0,1.666667,0Z')
  assertPathEqual(a([[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]), 'M1.666667,8.333333C3.333333,10,6.666667,10,8.333333,8.333333C10,6.666667,10,3.333333,8.333333,1.666667L8.333333,0C10,0,10,0,8.333333,0C6.666667,0,3.333333,0,1.666667,0Z')
})
