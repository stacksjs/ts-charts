import { describe, it, expect } from 'bun:test'
import { stackOrderReverse } from '../../src/index.ts'

it('stackOrderReverse(series) returns [series.length - 1, series.length - 2, ... 0]', () => {
  expect(stackOrderReverse(new Array(4) as any)).toEqual([3, 2, 1, 0])
})
