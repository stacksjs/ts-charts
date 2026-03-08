import identity from '../identity.ts'
import stream from '../stream.ts'
import pathArea from './area.ts'
import pathBounds from './bounds.ts'
import pathCentroid from './centroid.ts'
import PathContext from './context.ts'
import pathMeasure from './measure.ts'
import PathString from './string.ts'
import type { GeoStream, GeoStreamFactory, GeoObject, GeoProjection, GeoPathContext } from '../types.ts'

interface GeoPathGenerator {
  (this: unknown, object: GeoObject): string | null
  area(object: GeoObject): number
  measure(object: GeoObject): number
  bounds(object: GeoObject): number[][]
  centroid(object: GeoObject): number[]
  projection(_?: GeoProjection | null): any
  context(_?: GeoPathContext | null): any
  pointRadius(_?: number | ((this: unknown, ...args: unknown[]) => number)): any
  digits(_?: number | null): any
}

export default function geoPath(projection?: GeoProjection | null, context?: GeoPathContext | null): GeoPathGenerator {
  let digits: number | null = 3,
      pointRadius: number | ((this: unknown, ...args: unknown[]) => number) = 4.5,
      projectionStream: GeoStreamFactory,
      contextStream: PathString | PathContext

  function path(this: unknown, object: GeoObject): string | null {
    if (object) {
      if (typeof pointRadius === 'function') contextStream.pointRadius(+pointRadius.apply(this, arguments as unknown as unknown[]))
      stream(object, projectionStream(contextStream as unknown as GeoStream))
    }
    return contextStream.result() as string | null
  }

  path.area = function (object: GeoObject): number {
    stream(object, projectionStream(pathArea))
    return pathArea.result()
  }

  path.measure = function (object: GeoObject): number {
    stream(object, projectionStream(pathMeasure))
    return pathMeasure.result()
  }

  path.bounds = function (object: GeoObject): number[][] {
    stream(object, projectionStream(pathBounds))
    return pathBounds.result()
  }

  path.centroid = function (object: GeoObject): number[] {
    stream(object, projectionStream(pathCentroid))
    return pathCentroid.result()
  }

  path.projection = function (_?: GeoProjection | null): GeoPathGenerator | GeoProjection | null {
    if (!arguments.length) return projection ?? null
    projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream as unknown as GeoStreamFactory
    return path as unknown as GeoPathGenerator
  }

  path.context = function (_?: GeoPathContext | null): GeoPathGenerator | GeoPathContext | null {
    if (!arguments.length) return context ?? null
    contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext(context = _)
    if (typeof pointRadius !== 'function') contextStream.pointRadius(pointRadius)
    return path as unknown as GeoPathGenerator
  }

  path.pointRadius = function (_?: number | ((this: unknown, ...args: unknown[]) => number)): GeoPathGenerator | number | ((this: unknown, ...args: unknown[]) => number) {
    if (!arguments.length) return pointRadius
    pointRadius = typeof _ === 'function' ? _ : (contextStream.pointRadius(+_!), +_!)
    return path as unknown as GeoPathGenerator
  }

  path.digits = function (_?: number | null): GeoPathGenerator | number | null {
    if (!arguments.length) return digits
    if (_ == null) digits = null
    else {
      const d = Math.floor(_)
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`)
      digits = d
    }
    if (context === null) contextStream = new PathString(digits)
    return path as unknown as GeoPathGenerator
  }

  return (path as unknown as GeoPathGenerator).projection(projection!).digits(digits).context(context!)
}
