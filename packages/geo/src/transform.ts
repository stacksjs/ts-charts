import type { GeoStream, GeoStreamFactory, GeoTransformMethods, GeoTransformInstance } from './types.ts'

export default function geoTransform(methods: GeoTransformMethods): { stream: GeoStreamFactory } {
  return {
    stream: transformer(methods)
  }
}

export function transformer(methods: GeoTransformMethods): GeoStreamFactory {
  return function (stream: GeoStream): GeoStream {
    const s: GeoTransformInstance = new (TransformStream as unknown as { new(): GeoTransformInstance })()
    for (const key in methods) s[key] = (methods as Record<string, unknown>)[key]
    s.stream = stream
    return s
  }
}

function TransformStream(this: GeoTransformInstance): void {}

TransformStream.prototype = {
  constructor: TransformStream,
  point: function (this: GeoTransformInstance, x: number, y: number): void { this.stream.point(x, y) },
  sphere: function (this: GeoTransformInstance): void { this.stream.sphere!() },
  lineStart: function (this: GeoTransformInstance): void { this.stream.lineStart() },
  lineEnd: function (this: GeoTransformInstance): void { this.stream.lineEnd() },
  polygonStart: function (this: GeoTransformInstance): void { this.stream.polygonStart() },
  polygonEnd: function (this: GeoTransformInstance): void { this.stream.polygonEnd() }
}
