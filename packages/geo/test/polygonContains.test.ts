import { describe, it, expect } from 'bun:test'
import { geoCircle } from '../src/index.ts'
import polygonContains from '../src/polygonContains.ts'

function geoPolygonContains(polygon: number[][][], point: number[]): boolean {
  return polygonContains(polygon.map(ringRadians), pointRadians(point))
}

function ringRadians(ring: number[][]): number[][] {
  const r = ring.map(pointRadians)
  r.pop()
  return r
}

function pointRadians(point: number[]): number[] {
  return [point[0] * Math.PI / 180, point[1] * Math.PI / 180]
}

describe('geoPolygonContains', () => {
  it('geoPolygonContains(empty, point) returns false', () => {
    expect(geoPolygonContains([], [0, 0])).toBe(false)
  })

  it('geoPolygonContains(simple, point) returns the expected value', () => {
    const polygon = [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
    expect(geoPolygonContains(polygon, [0.1, 2])).toBe(false)
    expect(geoPolygonContains(polygon, [0.1, 0.1])).toBe(true)
  })

  it('geoPolygonContains(smallCircle, point) returns the expected value', () => {
    const polygon = geoCircle().radius(60)().coordinates as number[][][]
    expect(geoPolygonContains(polygon, [-180, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [1, 1])).toBe(true)
  })

  it('geoPolygonContains wraps longitudes', () => {
    const polygon = geoCircle().center([300, 0])().coordinates as number[][][]
    expect(geoPolygonContains(polygon, [300, 0])).toBe(true)
    expect(geoPolygonContains(polygon, [-60, 0])).toBe(true)
    expect(geoPolygonContains(polygon, [-420, 0])).toBe(true)
  })

  it('geoPolygonContains(southPole, point) returns the expected value', () => {
    const polygon = [[[-60, -80], [60, -80], [180, -80], [-60, -80]]]
    expect(geoPolygonContains(polygon, [0, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, -85])).toBe(true)
    expect(geoPolygonContains(polygon, [0, -90])).toBe(true)
  })

  it('geoPolygonContains(northPole, point) returns the expected value', () => {
    const polygon = [[[60, 80], [-60, 80], [-180, 80], [60, 80]]]
    expect(geoPolygonContains(polygon, [0, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 85])).toBe(true)
    expect(geoPolygonContains(polygon, [0, 90])).toBe(true)
    expect(geoPolygonContains(polygon, [-100, 90])).toBe(true)
    expect(geoPolygonContains(polygon, [0, -90])).toBe(false)
  })

  it('geoPolygonContains(touchingPole, Pole) returns true (issue #105)', () => {
    const polygon = [[[0, -30], [120, -30], [0, -90], [0, -30]]]
    expect(geoPolygonContains(polygon, [0, -90])).toBe(false)
    expect(geoPolygonContains(polygon, [-60, -90])).toBe(false)
    expect(geoPolygonContains(polygon, [60, -90])).toBe(false)
    const polygon2 = [[[0, 30], [-120, 30], [0, 90], [0, 30]]]
    expect(geoPolygonContains(polygon2, [0, 90])).toBe(false)
    expect(geoPolygonContains(polygon2, [-60, 90])).toBe(false)
    expect(geoPolygonContains(polygon2, [60, 90])).toBe(false)
  })

  it('geoPolygonContains(southHemispherePoly) returns the expected value', () => {
    const polygon = [[[0, 0], [10, -40], [-10, -40], [0, 0]]]
    expect(geoPolygonContains(polygon, [0, -40.2])).toBe(true)
    expect(geoPolygonContains(polygon, [0, -40.5])).toBe(false)
  })

  it('geoPolygonContains(largeNearOrigin, point) returns the expected value', () => {
    const polygon = [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    expect(geoPolygonContains(polygon, [0.1, 0.1])).toBe(false)
    expect(geoPolygonContains(polygon, [2, 0.1])).toBe(true)
  })

  it('geoPolygonContains(largeNearSouthPole, point) returns the expected value', () => {
    const polygon = [[[-60, 80], [60, 80], [180, 80], [-60, 80]]]
    expect(geoPolygonContains(polygon, [0, 85])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
  })

  it('geoPolygonContains(largeNearNorthPole, point) returns the expected value', () => {
    const polygon = [[[60, -80], [-60, -80], [-180, -80], [60, -80]]]
    expect(geoPolygonContains(polygon, [0, -85])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
  })

  it('geoPolygonContains(largeCircle, point) returns the expected value', () => {
    const polygon = geoCircle().radius(120)().coordinates as number[][][]
    expect(geoPolygonContains(polygon, [-180, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [-90, 0])).toBe(true)
  })

  it('geoPolygonContains(largeNarrowStripHole, point) returns the expected value', () => {
    const polygon = [[[-170, -1], [0, -1], [170, -1], [170, 1], [0, 1], [-170, 1], [-170, -1]]]
    expect(geoPolygonContains(polygon, [0, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 20])).toBe(true)
  })

  it('geoPolygonContains(largeNarrowEquatorialHole, point) returns the expected value', () => {
    const circle = geoCircle().center([0, -90]),
      ring0 = (circle.radius(90 - 0.01)().coordinates as number[][][])[0],
      ring1 = (circle.radius(90 + 0.01)().coordinates as number[][][])[0].reverse(),
      polygon = [ring0, ring1]
    expect(geoPolygonContains(polygon, [0, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, -90])).toBe(true)
  })

  it('geoPolygonContains(largeNarrowEquatorialStrip, point) returns the expected value', () => {
    const circle = geoCircle().center([0, -90]),
      ring0 = (circle.radius(90 + 0.01)().coordinates as number[][][])[0],
      ring1 = (circle.radius(90 - 0.01)().coordinates as number[][][])[0].reverse(),
      polygon = [ring0, ring1]
    expect(geoPolygonContains(polygon, [0, -90])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
  })

  it('geoPolygonContains(ringNearOrigin, point) returns the expected value', () => {
    const ring0 = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]],
      ring1 = [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6], [0.4, 0.4]],
      polygon = [ring0, ring1]
    expect(geoPolygonContains(polygon, [0.5, 0.5])).toBe(false)
    expect(geoPolygonContains(polygon, [0.1, 0.5])).toBe(true)
  })

  it('geoPolygonContains(ringEquatorial, point) returns the expected value', () => {
    const ring0 = [[0, -10], [-120, -10], [120, -10], [0, -10]],
      ring1 = [[0, 10], [120, 10], [-120, 10], [0, 10]],
      polygon = [ring0, ring1]
    expect(geoPolygonContains(polygon, [0, 20])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
  })

  it('geoPolygonContains(ringExcludingBothPoles, point) returns the expected value', () => {
    const ring0 = [[10, 10], [-10, 10], [-10, -10], [10, -10], [10, 10]].reverse(),
      ring1 = [[170, 10], [170, -10], [-170, -10], [-170, 10], [170, 10]].reverse(),
      polygon = [ring0, ring1]
    expect(geoPolygonContains(polygon, [0, 90])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
  })

  it('geoPolygonContains(ringContainingBothPoles, point) returns the expected value', () => {
    const ring0 = [[10, 10], [-10, 10], [-10, -10], [10, -10], [10, 10]],
      ring1 = [[170, 10], [170, -10], [-170, -10], [-170, 10], [170, 10]],
      polygon = [ring0, ring1]
    expect(geoPolygonContains(polygon, [0, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 20])).toBe(true)
  })

  it('geoPolygonContains(ringContainingSouthPole, point) returns the expected value', () => {
    const ring0 = [[10, 10], [-10, 10], [-10, -10], [10, -10], [10, 10]],
      ring1 = [[0, 80], [120, 80], [-120, 80], [0, 80]],
      polygon = [ring0, ring1]
    expect(geoPolygonContains(polygon, [0, 90])).toBe(false)
    expect(geoPolygonContains(polygon, [0, -90])).toBe(true)
  })

  it('geoPolygonContains(ringContainingNorthPole, point) returns the expected value', () => {
    const ring0 = [[10, 10], [-10, 10], [-10, -10], [10, -10], [10, 10]].reverse(),
      ring1 = [[0, 80], [120, 80], [-120, 80], [0, 80]].reverse(),
      polygon = [ring0, ring1]
    expect(geoPolygonContains(polygon, [0, -90])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 90])).toBe(true)
  })

  it('geoPolygonContains(selfIntersectingNearOrigin, point) returns the expected value', () => {
    const polygon = [[[0, 0], [1, 0], [1, 3], [3, 3], [3, 1], [0, 1], [0, 0]]]
    expect(geoPolygonContains(polygon, [15, 0.5])).toBe(false)
    expect(geoPolygonContains(polygon, [12, 2])).toBe(false)
    expect(geoPolygonContains(polygon, [0.5, 0.5])).toBe(true)
    expect(geoPolygonContains(polygon, [2, 2])).toBe(true)
  })

  it('geoPolygonContains(selfIntersectingNearSouthPole, point) returns the expected value', () => {
    const polygon = [[[-10, -80], [120, -80], [-120, -80], [10, -85], [10, -75], [-10, -75], [-10, -80]]]
    expect(geoPolygonContains(polygon, [0, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, -76])).toBe(true)
    expect(geoPolygonContains(polygon, [0, -89])).toBe(true)
  })

  it('geoPolygonContains(selfIntersectingNearNorthPole, point) returns the expected value', () => {
    const polygon = [[[-10, 80], [-10, 75], [10, 75], [10, 85], [-120, 80], [120, 80], [-10, 80]]]
    expect(geoPolygonContains(polygon, [0, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 76])).toBe(true)
    expect(geoPolygonContains(polygon, [0, 89])).toBe(true)
  })

  it('geoPolygonContains(hemisphereTouchingTheSouthPole, point) returns the expected value', () => {
    const polygon = geoCircle().radius(90)().coordinates as number[][][]
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
  })

  it('geoPolygonContains(triangleTouchingTheSouthPole, point) returns the expected value', () => {
    const polygon = [[[180, -90], [-45, 0], [45, 0], [180, -90]]]
    expect(geoPolygonContains(polygon, [-46, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 1])).toBe(false)
    expect(geoPolygonContains(polygon, [-90, -80])).toBe(false)
    expect(geoPolygonContains(polygon, [-44, 0])).toBe(true)
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
    expect(geoPolygonContains(polygon, [0, -30])).toBe(true)
    expect(geoPolygonContains(polygon, [30, -80])).toBe(true)
  })

  it('geoPolygonContains(triangleTouchingTheSouthPole2, point) returns the expected value', () => {
    const polygon = [[[-45, 0], [45, 0], [180, -90], [-45, 0]]]
    expect(geoPolygonContains(polygon, [-46, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 1])).toBe(false)
    expect(geoPolygonContains(polygon, [-90, -80])).toBe(false)
    expect(geoPolygonContains(polygon, [-44, 0])).toBe(true)
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
    expect(geoPolygonContains(polygon, [0, -30])).toBe(true)
    expect(geoPolygonContains(polygon, [30, -80])).toBe(true)
  })

  it('geoPolygonContains(triangleTouchingTheSouthPole3, point) returns the expected value', () => {
    const polygon = [[[180, -90], [-135, 0], [135, 0], [180, -90]]]
    expect(geoPolygonContains(polygon, [180, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [150, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [180, -30])).toBe(false)
    expect(geoPolygonContains(polygon, [150, -80])).toBe(false)
    expect(geoPolygonContains(polygon, [0, 0])).toBe(true)
    expect(geoPolygonContains(polygon, [180, 1])).toBe(true)
    expect(geoPolygonContains(polygon, [-90, -80])).toBe(true)
  })

  it('geoPolygonContains(triangleTouchingTheNorthPole, point) returns the expected value', () => {
    const polygon = [[[180, 90], [45, 0], [-45, 0], [180, 90]]]
    expect(geoPolygonContains(polygon, [-90, 0])).toBe(false)
    expect(geoPolygonContains(polygon, [0, -1])).toBe(false)
    expect(geoPolygonContains(polygon, [0, -80])).toBe(false)
    expect(geoPolygonContains(polygon, [-90, 1])).toBe(false)
    expect(geoPolygonContains(polygon, [-90, 80])).toBe(false)
    expect(geoPolygonContains(polygon, [-44, 10])).toBe(true)
    expect(geoPolygonContains(polygon, [0, 10])).toBe(true)
    expect(geoPolygonContains(polygon, [30, 80])).toBe(true)
  })
})
