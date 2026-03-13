/**
 * A GeoStream sink receives geometric data via method calls.
 * This is the core streaming interface used throughout the geo package.
 */
export interface GeoStream {
  point(x: number, y: number, z?: number): void
  lineStart(): void
  lineEnd(): void
  polygonStart(): void
  polygonEnd(): void
  sphere?(): void
}

/**
 * A GeoStream with a result method, used by path area/bounds/centroid/measure streams.
 */
export interface GeoStreamResult<T> extends GeoStream {
  result(): T
}

/**
 * A raw projection function that maps (lambda, phi) to [x, y].
 * May have an `.invert` method for the reverse mapping.
 */
export interface GeoRawProjection {
  (x: number, y: number): number[]
  invert?: (x: number, y: number) => number[]
}

/**
 * A clip/transform stream factory: takes a sink stream and returns a new stream that wraps it.
 */
// eslint-disable-next-line pickier/no-unused-vars
export type GeoStreamFactory = (stream: GeoStream) => GeoStream

/**
 * Represents any GeoJSON-like object passed to geoStream, geoArea, geoBounds, etc.
 * Using a minimal structural type rather than strict GeoJSON for flexibility.
 */
export interface GeoObject {
  type: string
  coordinates?: number[] | number[][] | number[][][] | number[][][][]
  geometry?: GeoObject | null
  geometries?: GeoObject[]
  features?: GeoFeature[]
  properties?: Record<string, unknown>
}

export interface GeoFeature {
  type: 'Feature'
  geometry: GeoObject | null
  properties?: Record<string, unknown>
}

/**
 * A GeoJSON-like geometry object used in contains/stream dispatch tables.
 */
export interface GeoGeometry {
  type: string
  coordinates: number[] | number[][] | number[][][] | number[][][][]
}

/**
 * The projection object returned by projection factories.
 * Uses getter/setter pattern: call with no args to get, with args to set.
 *
 * Note: getter/setter methods use `any` return type because D3's pattern
 * returns different types depending on whether arguments are provided.
 * Typing them with union return types breaks method chaining.
 */
export interface GeoProjection {
  (point: number[]): number[] | null
  invert?: (point: number[]) => number[] | null
  stream(stream: GeoStream): GeoStream
  preclip(_?: GeoStreamFactory): any
  postclip(_?: GeoStreamFactory): any
  clipAngle(_?: number | null): any
  clipExtent(_?: number[][] | null): any
  scale(_?: number): any
  translate(_?: number[]): any
  center(_?: number[]): any
  rotate(_?: number[]): any
  angle(_?: number): any
  reflectX(_?: boolean): any
  reflectY(_?: boolean): any
  precision(_?: number): any
  fitExtent(extent: number[][], object: GeoObject): GeoProjection
  fitSize(size: number[], object: GeoObject): GeoProjection
  fitWidth(width: number, object: GeoObject): GeoProjection
  fitHeight(height: number, object: GeoObject): GeoProjection
}

/**
 * A conic projection with the additional parallels getter/setter.
 */
export interface GeoConicProjection extends GeoProjection {
  parallels(_?: number[]): any
}

/**
 * The clip buffer stream used in clip algorithms, extends GeoStream with rejoin/result.
 */
export interface ClipBuffer extends GeoStream {
  rejoin(): void
  result(): number[][][]
}

/**
 * The clip line stream used in clip algorithms, extends GeoStream with clean method.
 */
export interface ClipLine extends GeoStream {
  clean(): number
}

/**
 * Interpolation function with a distance property.
 */
export interface GeoInterpolator {
  (t: number): number[]
  distance: number
}

/**
 * Context for path rendering (e.g., CanvasRenderingContext2D).
 */
export interface GeoPathContext {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  closePath(): void
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void
}

/**
 * Methods for geoTransform.
 */
export interface GeoTransformMethods {
  point?(this: GeoTransformInstance, x: number, y: number): void
  lineStart?(this: GeoTransformInstance): void
  lineEnd?(this: GeoTransformInstance): void
  polygonStart?(this: GeoTransformInstance): void
  polygonEnd?(this: GeoTransformInstance): void
  sphere?(this: GeoTransformInstance): void
}

export interface GeoTransformInstance extends GeoStream {
  stream: GeoStream
  [key: string]: unknown
}

/**
 * Rotation function with invert.
 */
export interface GeoRotation {
  (coordinates: number[]): number[]
  invert(coordinates: number[]): number[]
}

/**
 * Internal rotation function operating on radians.
 */
export interface GeoRadianRotation {
  (lambda: number, phi: number): number[]
  invert(lambda: number, phi: number): number[]
}
