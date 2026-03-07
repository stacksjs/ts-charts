import { describe, it, expect } from 'bun:test'
import { geoGnomonic, geoMercator } from '../../src/index.ts'
import { assertInDelta } from '../helpers/asserts.ts'
import { assertProjectionEqual } from '../helpers/projectionAsserts.ts'

describe('projection.reflect', () => {
  it('projection.reflectX(...) defaults to false', () => {
    const projection = geoGnomonic().scale(1).translate([0, 0])
    expect(projection.reflectX()).toBe(false)
    expect(projection.reflectY()).toBe(false)
    assertProjectionEqual(projection, [0, 0], [0, 0])
    assertProjectionEqual(projection, [10, 0], [0.17632698070846498, 0])
    assertProjectionEqual(projection, [0, 10], [0, -0.17632698070846498])
  })

  it('projection.reflectX(...) mirrors x after projecting', () => {
    const projection = geoGnomonic().scale(1).translate([0, 0]).reflectX(true)
    expect(projection.reflectX()).toBe(true)
    assertProjectionEqual(projection, [0, 0], [0, 0])
    assertProjectionEqual(projection, [10, 0], [-0.17632698070846498, 0])
    assertProjectionEqual(projection, [0, 10], [0, -0.17632698070846498])
    projection.reflectX(false).reflectY(true)
    expect(projection.reflectX()).toBe(false)
    expect(projection.reflectY()).toBe(true)
    assertProjectionEqual(projection, [0, 0], [0, 0])
    assertProjectionEqual(projection, [10, 0], [0.17632698070846498, 0])
    assertProjectionEqual(projection, [0, 10], [0, 0.17632698070846498])
  })

  it('projection.reflectX(...) works with projection.angle()', () => {
    const projection = geoMercator().scale(1).translate([10, 20]).reflectX(true).angle(45)
    expect(projection.reflectX()).toBe(true)
    assertInDelta(projection.angle(), 45)
    assertProjectionEqual(projection, [0, 0], [10, 20])
    assertProjectionEqual(projection, [10, 0], [9.87658658, 20.12341341])
    assertProjectionEqual(projection, [0, 10], [9.87595521, 19.87595521])
  })
})
