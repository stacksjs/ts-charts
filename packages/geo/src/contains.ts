import polygonContains from './polygonContains.ts'
import distance from './distance.ts'
import { epsilon2, radians } from './math.ts'
import type { GeoObject } from './types.ts'

const containsObjectType: Record<string, (object: GeoObject, point: number[]) => boolean> = {
  Feature: function (object: GeoObject, point: number[]): boolean {
    return containsGeometry(object.geometry!, point)
  },
  FeatureCollection: function (object: GeoObject, point: number[]): boolean {
    const features = object.features!
    let i = -1
    const n = features.length
    while (++i < n) if (containsGeometry(features[i].geometry!, point)) return true
    return false
  }
}

const containsGeometryType: Record<string, (object: GeoObject, point: number[]) => boolean> = {
  Sphere: function (): boolean {
    return true
  },
  Point: function (object: GeoObject, point: number[]): boolean {
    return containsPoint(object.coordinates as number[], point)
  },
  MultiPoint: function (object: GeoObject, point: number[]): boolean {
    const coordinates = object.coordinates as number[][]
    let i = -1
    const n = coordinates.length
    while (++i < n) if (containsPoint(coordinates[i], point)) return true
    return false
  },
  LineString: function (object: GeoObject, point: number[]): boolean {
    return containsLine(object.coordinates as number[][], point)
  },
  MultiLineString: function (object: GeoObject, point: number[]): boolean {
    const coordinates = object.coordinates as number[][][]
    let i = -1
    const n = coordinates.length
    while (++i < n) if (containsLine(coordinates[i], point)) return true
    return false
  },
  Polygon: function (object: GeoObject, point: number[]): boolean {
    return containsPolygon(object.coordinates as number[][][], point)
  },
  MultiPolygon: function (object: GeoObject, point: number[]): boolean {
    const coordinates = object.coordinates as number[][][][]
    let i = -1
    const n = coordinates.length
    while (++i < n) if (containsPolygon(coordinates[i], point)) return true
    return false
  },
  GeometryCollection: function (object: GeoObject, point: number[]): boolean {
    const geometries = object.geometries!
    let i = -1
    const n = geometries.length
    while (++i < n) if (containsGeometry(geometries[i], point)) return true
    return false
  }
}

function containsGeometry(geometry: GeoObject, point: number[]): boolean {
  return geometry && containsGeometryType.hasOwnProperty(geometry.type)
      ? containsGeometryType[geometry.type](geometry, point)
      : false
}

function containsPoint(coordinates: number[], point: number[]): boolean {
  return distance(coordinates, point) === 0
}

function containsLine(coordinates: number[][], point: number[]): boolean {
  let ao: number = 0, bo: number, ab: number
  for (let i = 0, n = coordinates.length; i < n; i++) {
    bo = distance(coordinates[i], point)
    if (bo === 0) return true
    if (i > 0) {
      ab = distance(coordinates[i], coordinates[i - 1])
      if (
        ab > 0 &&
        ao <= ab &&
        bo <= ab &&
        (ao + bo - ab) * (1 - Math.pow((ao - bo) / ab, 2)) < epsilon2 * ab
      )
        return true
    }
    ao = bo
  }
  return false
}

function containsPolygon(coordinates: number[][][], point: number[]): boolean {
  return !!polygonContains(coordinates.map(ringRadians), pointRadians(point))
}

function ringRadians(ring: number[][]): number[][] {
  const result = ring.map(pointRadians)
  result.pop()
  return result
}

function pointRadians(point: number[]): number[] {
  return [point[0] * radians, point[1] * radians]
}

export default function geoContains(object: GeoObject, point: number[]): boolean {
  return (object && containsObjectType.hasOwnProperty(object.type)
      ? containsObjectType[object.type]
      : containsGeometry)(object, point)
}
