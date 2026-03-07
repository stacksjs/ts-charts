import { describe, it, expect } from 'bun:test'
import { line, curveLinearClosed } from '../../src/index.ts'
import { assertPathEqual } from '../asserts.ts'

it('line.curve(curveLinearClosed)(data) generates the expected path', () => {
  const l = line().curve(curveLinearClosed)
  expect(l([])).toBeNull()
  assertPathEqual(l([[0, 1]]), 'M0,1Z')
  assertPathEqual(l([[0, 1], [2, 3]]), 'M0,1L2,3Z')
  assertPathEqual(l([[0, 1], [2, 3], [4, 5]]), 'M0,1L2,3L4,5Z')
})
