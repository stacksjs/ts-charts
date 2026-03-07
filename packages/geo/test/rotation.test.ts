import { describe, it, expect } from 'bun:test'
import { geoRotation } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number) {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('geoRotation', () => {
  it('a rotation of [+90, 0] only rotates longitude', () => {
    const rotation = geoRotation([90, 0])([0, 0])
    assertInDelta(rotation[0], 90, 1e-6)
    assertInDelta(rotation[1], 0, 1e-6)
  })

  it('a rotation of [+90, 0] wraps around when crossing the antimeridian', () => {
    const rotation = geoRotation([90, 0])([150, 0])
    assertInDelta(rotation[0], -120, 1e-6)
    assertInDelta(rotation[1], 0, 1e-6)
  })

  it('a rotation of [-45, 45] rotates longitude and latitude', () => {
    const rotation = geoRotation([-45, 45])([0, 0])
    assertInDelta(rotation[0], -54.73561, 1e-6)
    assertInDelta(rotation[1], 30, 1e-6)
  })

  it('a rotation of [-45, 45] inverse rotation of longitude and latitude', () => {
    const rotation = geoRotation([-45, 45]).invert([-54.73561, 30])
    assertInDelta(rotation[0], 0, 1e-6)
    assertInDelta(rotation[1], 0, 1e-6)
  })

  it('the identity rotation constrains longitudes to [-180, 180]', () => {
    const rotate = geoRotation([0, 0])
    expect(rotate([180, 0])[0]).toBe(180)
    expect(rotate([-180, 0])[0]).toBe(-180)
    expect(rotate([360, 0])[0]).toBe(0)
    assertInDelta(rotate([2562, 0])[0], 42, 1e-10)
    assertInDelta(rotate([-2562, 0])[0], -42, 1e-10)
  })
})
