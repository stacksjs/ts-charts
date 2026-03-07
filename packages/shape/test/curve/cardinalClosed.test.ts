import { describe, it, expect } from 'bun:test'
import { area, line, curveCardinalClosed } from '../../src/index.ts'
import { assertPathEqual } from '../asserts.ts'

it('line.curve(curveCardinalClosed)(data) generates the expected path', () => {
  const l = line().curve(curveCardinalClosed)
  expect(l([])).toBeNull()
  assertPathEqual(l([[0, 1]]), 'M0,1Z')
  assertPathEqual(l([[0, 1], [1, 3]]), 'M1,3L0,1Z')
  assertPathEqual(l([[0, 1], [1, 3], [2, 1]]), 'M1,3C1.333333,3,2.166667,1.333333,2,1C1.833333,0.666667,0.166667,0.666667,0,1C-0.166667,1.333333,0.666667,3,1,3')
  assertPathEqual(l([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M1,3C1.333333,3,1.666667,1,2,1C2.333333,1,3.333333,3,3,3C2.666667,3,0.333333,1,0,1C-0.333333,1,0.666667,3,1,3')
})

it('line.curve(curveCardinalClosed) uses a default tension of zero', () => {
  const l = line().curve(curveCardinalClosed.tension(0))
  expect(line().curve(curveCardinalClosed)([[0, 1], [1, 3], [2, 1], [3, 3]])).toBe(l([[0, 1], [1, 3], [2, 1], [3, 3]]))
})

it('line.curve(curveCardinalClosed.tension(tension)) uses the specified tension', () => {
  assertPathEqual(line().curve(curveCardinalClosed.tension(0.5))([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M1,3C1.166667,3,1.833333,1,2,1C2.166667,1,3.166667,3,3,3C2.833333,3,0.166667,1,0,1C-0.166667,1,0.833333,3,1,3')
})

it('line.curve(curveCardinalClosed.tension(tension)) coerces the specified tension to a number', () => {
  const l = line().curve(curveCardinalClosed.tension('0.5' as any))
  expect(line().curve(curveCardinalClosed.tension(0.5))([[0, 1], [1, 3], [2, 1], [3, 3]])).toBe(l([[0, 1], [1, 3], [2, 1], [3, 3]]))
})

it('area.curve(curveCardinalClosed)(data) generates the expected path', () => {
  const a = area().curve(curveCardinalClosed)
  expect(a([])).toBeNull()
  expect(a([[0, 1]])).toBe('M0,1ZM0,0Z')
  expect(a([[0, 1], [1, 3]])).toBe('M1,3L0,1ZM0,0L1,0Z')
  assertPathEqual(a([[0, 1], [1, 3], [2, 1]]), 'M1,3C1.333333,3,2.166667,1.333333,2,1C1.833333,0.666667,0.166667,0.666667,0,1C-0.166667,1.333333,0.666667,3,1,3M1,0C0.666667,0,-0.166667,0,0,0C0.166667,0,1.833333,0,2,0C2.166667,0,1.333333,0,1,0')
  assertPathEqual(a([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M1,3C1.333333,3,1.666667,1,2,1C2.333333,1,3.333333,3,3,3C2.666667,3,0.333333,1,0,1C-0.333333,1,0.666667,3,1,3M2,0C1.666667,0,1.333333,0,1,0C0.666667,0,-0.333333,0,0,0C0.333333,0,2.666667,0,3,0C3.333333,0,2.333333,0,2,0')
})

it('area.curve(curveCardinalClosed) uses a default tension of zero', () => {
  const a = area().curve(curveCardinalClosed.tension(0))
  expect(area().curve(curveCardinalClosed)([[0, 1], [1, 3], [2, 1], [3, 3]])).toBe(a([[0, 1], [1, 3], [2, 1], [3, 3]]))
})

it('area.curve(curveCardinalClosed.tension(tension)) uses the specified tension', () => {
  assertPathEqual(area().curve(curveCardinalClosed.tension(0.5))([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M1,3C1.166667,3,1.833333,1,2,1C2.166667,1,3.166667,3,3,3C2.833333,3,0.166667,1,0,1C-0.166667,1,0.833333,3,1,3M2,0C1.833333,0,1.166667,0,1,0C0.833333,0,-0.166667,0,0,0C0.166667,0,2.833333,0,3,0C3.166667,0,2.166667,0,2,0')
})

it('area.curve(curveCardinalClosed.tension(tension)) coerces the specified tension to a number', () => {
  const a = area().curve(curveCardinalClosed.tension('0.5' as any))
  expect(area().curve(curveCardinalClosed.tension(0.5))([[0, 1], [1, 3], [2, 1], [3, 3]])).toBe(a([[0, 1], [1, 3], [2, 1], [3, 3]]))
})
