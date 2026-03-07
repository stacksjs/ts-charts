import { describe, it, expect } from 'bun:test'
import { area, line, curveCardinalOpen } from '../../src/index.ts'
import { assertPathEqual } from '../asserts.ts'

it('line.curve(curveCardinalOpen)(data) generates the expected path', () => {
  const l = line().curve(curveCardinalOpen)
  expect(l([])).toBeNull()
  expect(l([[0, 1]])).toBeNull()
  expect(l([[0, 1], [1, 3]])).toBeNull()
  assertPathEqual(l([[0, 1], [1, 3], [2, 1]]), 'M1,3Z')
  assertPathEqual(l([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M1,3C1.333333,3,1.666667,1,2,1')
})

it('line.curve(curveCardinalOpen) uses a default tension of zero', () => {
  const l = line().curve(curveCardinalOpen.tension(0))
  expect(line().curve(curveCardinalOpen)([[0, 1], [1, 3], [2, 1], [3, 3]])).toBe(l([[0, 1], [1, 3], [2, 1], [3, 3]]))
})

it('line.curve(curveCardinalOpen.tension(tension)) uses the specified tension', () => {
  assertPathEqual(line().curve(curveCardinalOpen.tension(0.5))([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M1,3C1.166667,3,1.833333,1,2,1')
})

it('line.curve(curveCardinalOpen.tension(tension)) coerces the specified tension to a number', () => {
  const l = line().curve(curveCardinalOpen.tension('0.5' as any))
  expect(line().curve(curveCardinalOpen.tension(0.5))([[0, 1], [1, 3], [2, 1], [3, 3]])).toBe(l([[0, 1], [1, 3], [2, 1], [3, 3]]))
})

it('area.curve(curveCardinalOpen)(data) generates the expected path', () => {
  const a = area().curve(curveCardinalOpen)
  expect(a([])).toBeNull()
  expect(a([[0, 1]])).toBeNull()
  expect(a([[0, 1], [1, 3]])).toBeNull()
  assertPathEqual(a([[0, 1], [1, 3], [2, 1]]), 'M1,3L1,0Z')
  assertPathEqual(a([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M1,3C1.333333,3,1.666667,1,2,1L2,0C1.666667,0,1.333333,0,1,0Z')
})

it('area.curve(curveCardinalOpen) uses a default tension of zero', () => {
  const a = area().curve(curveCardinalOpen.tension(0))
  expect(area().curve(curveCardinalOpen)([[0, 1], [1, 3], [2, 1], [3, 3]])).toBe(a([[0, 1], [1, 3], [2, 1], [3, 3]]))
})

it('area.curve(curveCardinalOpen.tension(tension)) uses the specified tension', () => {
  assertPathEqual(area().curve(curveCardinalOpen.tension(0.5))([[0, 1], [1, 3], [2, 1], [3, 3]]), 'M1,3C1.166667,3,1.833333,1,2,1L2,0C1.833333,0,1.166667,0,1,0Z')
})

it('area.curve(curveCardinalOpen.tension(tension)) coerces the specified tension to a number', () => {
  const a = area().curve(curveCardinalOpen.tension('0.5' as any))
  expect(area().curve(curveCardinalOpen.tension(0.5))([[0, 1], [1, 3], [2, 1], [3, 3]])).toBe(a([[0, 1], [1, 3], [2, 1], [3, 3]]))
})
