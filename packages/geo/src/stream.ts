function streamGeometry(geometry: any, stream: any): void {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    (streamGeometryType as any)[geometry.type](geometry, stream)
  }
}

const streamObjectType: any = {
  Feature: function (object: any, stream: any): void {
    streamGeometry(object.geometry, stream)
  },
  FeatureCollection: function (object: any, stream: any): void {
    const features = object.features
    let i = -1
    const n = features.length
    while (++i < n) streamGeometry(features[i].geometry, stream)
  }
}

const streamGeometryType: any = {
  Sphere: function (_object: any, stream: any): void {
    stream.sphere()
  },
  Point: function (object: any, stream: any): void {
    object = object.coordinates
    stream.point(object[0], object[1], object[2])
  },
  MultiPoint: function (object: any, stream: any): void {
    const coordinates = object.coordinates
    let i = -1
    const n = coordinates.length
    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2])
  },
  LineString: function (object: any, stream: any): void {
    streamLine(object.coordinates, stream, 0)
  },
  MultiLineString: function (object: any, stream: any): void {
    const coordinates = object.coordinates
    let i = -1
    const n = coordinates.length
    while (++i < n) streamLine(coordinates[i], stream, 0)
  },
  Polygon: function (object: any, stream: any): void {
    streamPolygon(object.coordinates, stream)
  },
  MultiPolygon: function (object: any, stream: any): void {
    const coordinates = object.coordinates
    let i = -1
    const n = coordinates.length
    while (++i < n) streamPolygon(coordinates[i], stream)
  },
  GeometryCollection: function (object: any, stream: any): void {
    const geometries = object.geometries
    let i = -1
    const n = geometries.length
    while (++i < n) streamGeometry(geometries[i], stream)
  }
}

function streamLine(coordinates: any[], stream: any, closed: number): void {
  let i = -1
  const n = coordinates.length - closed
  let coordinate: any
  stream.lineStart()
  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2])
  stream.lineEnd()
}

function streamPolygon(coordinates: any[], stream: any): void {
  let i = -1
  const n = coordinates.length
  stream.polygonStart()
  while (++i < n) streamLine(coordinates[i], stream, 1)
  stream.polygonEnd()
}

export default function geoStream(object: any, stream: any): void {
  if (object && streamObjectType.hasOwnProperty(object.type)) {
    streamObjectType[object.type](object, stream)
  } else {
    streamGeometry(object, stream)
  }
}
