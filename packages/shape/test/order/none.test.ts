import { describe, it, expect } from 'bun:test'
import { stackOrderNone } from '../../src/index.ts'

it('stackOrderNone(series) returns [0, 1, ... series.length - 1]', () => {
  expect(stackOrderNone(new Array(4) as any)).toEqual([0, 1, 2, 3])
})
