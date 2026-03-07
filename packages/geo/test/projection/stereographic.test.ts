import { describe, it } from 'bun:test'
import { geoStereographic } from '../../src/index.ts'
import { assertProjectionEqual } from '../helpers/projectionAsserts.ts'

describe('stereographic', () => {
  it('stereographic(point) returns the expected result', () => {
    const stereographic = geoStereographic().translate([0, 0]).scale(1)
    assertProjectionEqual(stereographic, [  0,   0], [ 0,  0])
    assertProjectionEqual(stereographic, [-90,   0], [-1,  0])
    assertProjectionEqual(stereographic, [ 90,   0], [ 1,  0])
    assertProjectionEqual(stereographic, [  0, -90], [ 0,  1])
    assertProjectionEqual(stereographic, [  0,  90], [ 0, -1])
  })
})
