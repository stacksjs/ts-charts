import { describe, expect, it } from 'bun:test'
import { nice } from '../src/index.ts'

it('nice(start, stop, count) returns [niceStart, niceStop]', () => {
  expect(nice(1.1, 10.9, 10)).toEqual([1, 11])
  expect(nice(0, 0.46, 10)).toEqual([0, 0.5])
  expect(nice(0, 0.049, 10)).toEqual([0, 0.05])
})
