import identity from '../identity.ts'
import stream from '../stream.ts'
import pathArea from './area.ts'
import pathBounds from './bounds.ts'
import pathCentroid from './centroid.ts'
import PathContext from './context.ts'
import pathMeasure from './measure.ts'
import PathString from './string.ts'

export default function geoPath(projection?: any, context?: any): any {
  let digits = 3,
      pointRadius: any = 4.5,
      projectionStream: any,
      contextStream: any

  function path(this: any, object: any): any {
    if (object) {
      if (typeof pointRadius === 'function') contextStream.pointRadius(+pointRadius.apply(this, arguments))
      stream(object, projectionStream(contextStream))
    }
    return contextStream.result()
  }

  path.area = function (object: any): number {
    stream(object, projectionStream(pathArea))
    return pathArea.result()
  }

  path.measure = function (object: any): number {
    stream(object, projectionStream(pathMeasure))
    return pathMeasure.result()
  }

  path.bounds = function (object: any): number[][] {
    stream(object, projectionStream(pathBounds))
    return pathBounds.result()
  }

  path.centroid = function (object: any): number[] {
    stream(object, projectionStream(pathCentroid))
    return pathCentroid.result()
  }

  path.projection = function (_: any): any {
    if (!arguments.length) return projection
    projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream
    return path
  }

  path.context = function (_: any): any {
    if (!arguments.length) return context
    contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext(context = _)
    if (typeof pointRadius !== 'function') contextStream.pointRadius(pointRadius)
    return path
  }

  path.pointRadius = function (_: any): any {
    if (!arguments.length) return pointRadius
    pointRadius = typeof _ === 'function' ? _ : (contextStream.pointRadius(+_), +_)
    return path
  }

  path.digits = function (_: any): any {
    if (!arguments.length) return digits
    if (_ == null) digits = null as any
    else {
      const d = Math.floor(_)
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`)
      digits = d
    }
    if (context === null) contextStream = new PathString(digits)
    return path
  }

  return path.projection(projection).digits(digits).context(context)
}
