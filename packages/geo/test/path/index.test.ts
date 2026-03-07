import { describe, it, expect } from 'bun:test'
import { geoAlbers, geoEquirectangular, geoPath } from '../../src/index.ts'
import { testContext } from '../helpers/testContext.ts'

const equirectangular = geoEquirectangular()
  .scale(900 / Math.PI)
  .precision(0)

function testPath(projection: any, object: any) {
  const context = testContext()

  geoPath()
    .projection(projection)
    .context(context)(object)

  return context.result()
}

describe('geoPath', () => {
  it('geoPath.projection() defaults to null', () => {
    const path = geoPath()
    expect(path.projection()).toBe(null)
  })

  it('geoPath.context() defaults to null', () => {
    const path = geoPath()
    expect(path.context()).toBe(null)
  })

  it('geoPath(projection) sets the initial projection', () => {
    const projection = geoAlbers(), path = geoPath(projection)
    expect(path.projection()).toBe(projection)
  })

  it('geoPath(projection, context) sets the initial projection and context', () => {
    const context = testContext(), projection = geoAlbers(), path = geoPath(projection, context)
    expect(path.projection()).toBe(projection)
    expect(path.context()).toBe(context)
  })

  it('geoPath(Point) renders a point', () => {
    expect(testPath(equirectangular, {
      type: 'Point',
      coordinates: [-63, 18]
    })).toEqual([
      { type: 'moveTo', x: 170, y: 160 },
      { type: 'arc', x: 165, y: 160, r: 4.5 }
    ])
  })

  it('geoPath(MultiPoint) renders a point', () => {
    expect(testPath(equirectangular, {
      type: 'MultiPoint',
      coordinates: [[-63, 18], [-62, 18], [-62, 17]]
    })).toEqual([
      { type: 'moveTo', x: 170, y: 160 }, { type: 'arc', x: 165, y: 160, r: 4.5 },
      { type: 'moveTo', x: 175, y: 160 }, { type: 'arc', x: 170, y: 160, r: 4.5 },
      { type: 'moveTo', x: 175, y: 165 }, { type: 'arc', x: 170, y: 165, r: 4.5 }
    ])
  })

  it('geoPath(LineString) renders a line string', () => {
    expect(testPath(equirectangular, {
      type: 'LineString',
      coordinates: [[-63, 18], [-62, 18], [-62, 17]]
    })).toEqual([
      { type: 'moveTo', x: 165, y: 160 },
      { type: 'lineTo', x: 170, y: 160 },
      { type: 'lineTo', x: 170, y: 165 }
    ])
  })

  it('geoPath(Polygon) renders a polygon', () => {
    expect(testPath(equirectangular, {
      type: 'Polygon',
      coordinates: [[[-63, 18], [-62, 18], [-62, 17], [-63, 18]]]
    })).toEqual([
      { type: 'moveTo', x: 165, y: 160 },
      { type: 'lineTo', x: 170, y: 160 },
      { type: 'lineTo', x: 170, y: 165 },
      { type: 'closePath' }
    ])
  })

  it('geoPath(GeometryCollection) renders a geometry collection', () => {
    expect(testPath(equirectangular, {
      type: 'GeometryCollection',
      geometries: [{
        type: 'Polygon',
        coordinates: [[[-63, 18], [-62, 18], [-62, 17], [-63, 18]]]
      }]
    })).toEqual([
      { type: 'moveTo', x: 165, y: 160 },
      { type: 'lineTo', x: 170, y: 160 },
      { type: 'lineTo', x: 170, y: 165 },
      { type: 'closePath' }
    ])
  })

  it('geoPath(Feature) renders a feature', () => {
    expect(testPath(equirectangular, {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-63, 18], [-62, 18], [-62, 17], [-63, 18]]]
      }
    })).toEqual([
      { type: 'moveTo', x: 165, y: 160 },
      { type: 'lineTo', x: 170, y: 160 },
      { type: 'lineTo', x: 170, y: 165 },
      { type: 'closePath' }
    ])
  })

  it('geoPath(FeatureCollection) renders a feature collection', () => {
    expect(testPath(equirectangular, {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-63, 18], [-62, 18], [-62, 17], [-63, 18]]]
        }
      }]
    })).toEqual([
      { type: 'moveTo', x: 165, y: 160 },
      { type: 'lineTo', x: 170, y: 160 },
      { type: 'lineTo', x: 170, y: 165 },
      { type: 'closePath' }
    ])
  })

  it('geoPath(...) wraps longitudes outside of +/-180 degrees', () => {
    expect(testPath(equirectangular, {
      type: 'Point',
      coordinates: [180 + 1e-6, 0]
    })).toEqual([
      { type: 'moveTo', x: -415, y: 250 },
      { type: 'arc', x: -420, y: 250, r: 4.5 }
    ])
  })

  it('geoPath(...) observes the correct winding order of a tiny polygon', () => {
    expect(testPath(equirectangular, {
      type: 'Polygon',
      coordinates: [[
        [-0.06904102953339501, 0.346043661846373],
        [-6.725674252975136e-15, 0.3981303360336475],
        [-6.742247658534323e-15, -0.08812465346531581],
        [-0.17301258217724075, -0.12278150669440671],
        [-0.06904102953339501, 0.346043661846373]
      ]]
    })).toEqual([
      { type: 'moveTo', x: 480, y: 248 },
      { type: 'lineTo', x: 480, y: 248 },
      { type: 'lineTo', x: 480, y: 250 },
      { type: 'lineTo', x: 479, y: 251 },
      { type: 'closePath' }
    ])
  })

  it('geoPath.projection(null)(...) does not transform coordinates', () => {
    expect(testPath(null, {
      type: 'Polygon',
      coordinates: [[[-63, 18], [-62, 18], [-62, 17], [-63, 18]]]
    })).toEqual([
      { type: 'moveTo', x: -63, y: 18 },
      { type: 'lineTo', x: -62, y: 18 },
      { type: 'lineTo', x: -62, y: 17 },
      { type: 'closePath' }
    ])
  })

  it('geoPath.context(null)(null) returns null', () => {
    const path = geoPath()
    expect(path()).toBe(null)
    expect(path(null)).toBe(null)
    expect(path(undefined)).toBe(null)
  })

  it('geoPath.context(null)(Unknown) returns null', () => {
    const path = geoPath()
    expect(path({ type: 'Unknown' })).toBe(null)
    expect(path({ type: '__proto__' })).toBe(null)
  })

  it('geoPath(LineString) then geoPath(Point) does not treat the point as part of a line', () => {
    const context = testContext(), path = geoPath().projection(equirectangular).context(context)
    path({
      type: 'LineString',
      coordinates: [[-63, 18], [-62, 18], [-62, 17]]
    })
    expect(context.result()).toEqual([
      { type: 'moveTo', x: 165, y: 160 },
      { type: 'lineTo', x: 170, y: 160 },
      { type: 'lineTo', x: 170, y: 165 }
    ])
    path({
      type: 'Point',
      coordinates: [-63, 18]
    })
    expect(context.result()).toEqual([
      { type: 'moveTo', x: 170, y: 160 },
      { type: 'arc', x: 165, y: 160, r: 4.5 }
    ])
  })

  it('geoPath.digits() defaults to three', () => {
    const path = geoPath()
    expect(path.digits()).toBe(3)
  })

  it('geoPath.digits(digits) returns the current path after setting the digits option', () => {
    const path = geoPath()
    expect(path.digits(4)).toBe(path)
    expect(path.digits()).toBe(4)
    expect(path.digits(0).digits()).toBe(0)
    expect(geoPath().digits()).toBe(3)
  })

  it('geoPath.digits(nullish) sets digits to null', () => {
    const path = geoPath()
    expect(path.digits(null).digits()).toBe(null)
    expect(path.digits(undefined).digits()).toBe(null)
  })

  it('geoPath.digits(digits) floors and coerces digits if not nullish', () => {
    const path = geoPath()
    expect(path.digits(3.5).digits()).toBe(3)
    expect(path.digits(3.9).digits()).toBe(3)
    expect(path.digits('3').digits()).toBe(3)
    expect(path.digits(' 3').digits()).toBe(3)
    expect(path.digits('').digits()).toBe(0)
  })

  it('geoPath.digits(digits) throws if digits is not valid', () => {
    const path = geoPath()
    expect(() => path.digits(NaN).digits()).toThrow(RangeError)
    expect(() => path.digits(-1).digits()).toThrow(RangeError)
    expect(() => path.digits(-0.1).digits()).toThrow(RangeError)
  })

  it('path(object) respects the specified digits', () => {
    const line = { type: 'LineString', coordinates: [[Math.PI, Math.E], [Math.E, Math.PI]] }
    expect(geoPath().digits(0)(line)).toBe('M3,3L3,3')
    expect(geoPath().digits(1)(line)).toBe('M3.1,2.7L2.7,3.1')
    expect(geoPath().digits(2)(line)).toBe('M3.14,2.72L2.72,3.14')
    expect(geoPath().digits(3)(line)).toBe('M3.142,2.718L2.718,3.142')
    expect(geoPath().digits(4)(line)).toBe('M3.1416,2.7183L2.7183,3.1416')
    expect(geoPath().digits(5)(line)).toBe('M3.14159,2.71828L2.71828,3.14159')
    expect(geoPath().digits(6)(line)).toBe('M3.141593,2.718282L2.718282,3.141593')
    expect(geoPath().digits(40)(line)).toBe('M3.141592653589793,2.718281828459045L2.718281828459045,3.141592653589793')
    expect(geoPath().digits(null)(line)).toBe('M3.141592653589793,2.718281828459045L2.718281828459045,3.141592653589793')
  })

  it('path(object) handles variable-radius points with different digits', () => {
    const p1 = geoPath().digits(1)
    const p2 = geoPath().digits(2)
    const point = { type: 'Point', coordinates: [Math.PI, Math.E] }
    expect(p1.pointRadius(1)(point)).toBe('M3.1,2.7m0,1a1,1 0 1,1 0,-2a1,1 0 1,1 0,2z')
    expect(p1(point)).toBe('M3.1,2.7m0,1a1,1 0 1,1 0,-2a1,1 0 1,1 0,2z')
    expect(p1.pointRadius(2)(point)).toBe('M3.1,2.7m0,2a2,2 0 1,1 0,-4a2,2 0 1,1 0,4z')
    expect(p1(point)).toBe('M3.1,2.7m0,2a2,2 0 1,1 0,-4a2,2 0 1,1 0,4z')
    expect(p2.pointRadius(1)(point)).toBe('M3.14,2.72m0,1a1,1 0 1,1 0,-2a1,1 0 1,1 0,2z')
    expect(p2(point)).toBe('M3.14,2.72m0,1a1,1 0 1,1 0,-2a1,1 0 1,1 0,2z')
    expect(p1(point)).toBe('M3.1,2.7m0,2a2,2 0 1,1 0,-4a2,2 0 1,1 0,4z')
    expect(p2.pointRadius(2)(point)).toBe('M3.14,2.72m0,2a2,2 0 1,1 0,-4a2,2 0 1,1 0,4z')
    expect(p2(point)).toBe('M3.14,2.72m0,2a2,2 0 1,1 0,-4a2,2 0 1,1 0,4z')
    expect(p1(point)).toBe('M3.1,2.7m0,2a2,2 0 1,1 0,-4a2,2 0 1,1 0,4z')
  })
})
