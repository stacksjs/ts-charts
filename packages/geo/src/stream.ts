import type { GeoStream, GeoObject } from './types.ts'

function streamGeometry(geometry: GeoObject, stream: GeoStream): void {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream)
  }
}

const streamObjectType: Record<string, (object: GeoObject, stream: GeoStream) => void> = {
  Feature: function (object: GeoObject, stream: GeoStream): void {
    streamGeometry(object.geometry!, stream)
  },
  FeatureCollection: function (object: GeoObject, stream: GeoStream): void {
    const features = object.features!
    let i = -1
    const n = features.length
    while (++i < n) streamGeometry(features[i].geometry!, stream)
  }
}

const streamGeometryType: Record<string, (object: GeoObject, stream: GeoStream) => void> = {
  Sphere: function (_object: GeoObject, stream: GeoStream): void {
    stream.sphere!()
  },
  Point: function (object: GeoObject, stream: GeoStream): void {
    const c = object.coordinates as number[]
    stream.point(c[0], c[1], c[2])
  },
  MultiPoint: function (object: GeoObject, stream: GeoStream): void {
    const coordinates = object.coordinates as number[][]
    let i = -1
    const n = coordinates.length
    let c: number[]
    while (++i < n) c = coordinates[i], stream.point(c[0], c[1], c[2])
  },
  LineString: function (object: GeoObject, stream: GeoStream): void {
    streamLine(object.coordinates as number[][], stream, 0)
  },
  MultiLineString: function (object: GeoObject, stream: GeoStream): void {
    const coordinates = object.coordinates as number[][][]
    let i = -1
    const n = coordinates.length
    while (++i < n) streamLine(coordinates[i], stream, 0)
  },
  Polygon: function (object: GeoObject, stream: GeoStream): void {
    streamPolygon(object.coordinates as number[][][], stream)
  },
  MultiPolygon: function (object: GeoObject, stream: GeoStream): void {
    const coordinates = object.coordinates as number[][][][]
    let i = -1
    const n = coordinates.length
    while (++i < n) streamPolygon(coordinates[i], stream)
  },
  GeometryCollection: function (object: GeoObject, stream: GeoStream): void {
    const geometries = object.geometries!
    let i = -1
    const n = geometries.length
    while (++i < n) streamGeometry(geometries[i], stream)
  }
}

function streamLine(coordinates: number[][], stream: GeoStream, closed: number): void {
  let i = -1
  const n = coordinates.length - closed
  let coordinate: number[]
  stream.lineStart()
  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2])
  stream.lineEnd()
}

function streamPolygon(coordinates: number[][][], stream: GeoStream): void {
  let i = -1
  const n = coordinates.length
  stream.polygonStart()
  while (++i < n) streamLine(coordinates[i], stream, 1)
  stream.polygonEnd()
}

export default function geoStream(object: GeoObject, stream: GeoStream): void {
  if (object && streamObjectType.hasOwnProperty(object.type)) {
    streamObjectType[object.type](object, stream)
  } else {
    streamGeometry(object, stream)
  }
}
