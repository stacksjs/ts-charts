import clipAntimeridian from '../clip/antimeridian.ts'
import clipCircle from '../clip/circle.ts'
import clipRectangle from '../clip/rectangle.ts'
import compose from '../compose.ts'
import identity from '../identity.ts'
import { cos, degrees, radians, sin, sqrt } from '../math.ts'
import { rotateRadians } from '../rotation.ts'
import { transformer } from '../transform.ts'
import { fitExtent, fitSize, fitWidth, fitHeight } from './fit.ts'
import resample from './resample.ts'
import type { GeoStream, GeoStreamFactory, GeoRawProjection, GeoProjection, GeoObject, GeoTransformInstance } from '../types.ts'

const transformRadians: GeoStreamFactory = transformer({
  point: function (this: GeoTransformInstance, x: number, y: number): void {
    this.stream.point(x * radians, y * radians)
  }
})

function transformRotate(rotate: GeoRawProjection): GeoStreamFactory {
  return transformer({
    point: function (this: GeoTransformInstance, x: number, y: number): void {
      const r = rotate(x, y)
      return this.stream.point(r[0], r[1])
    }
  })
}

function scaleTranslate(k: number, dx: number, dy: number, sx: number, sy: number): GeoRawProjection {
  function transform(x: number, y: number): number[] {
    // eslint-disable-next-line pickier/no-unused-vars
    x *= sx
    y *= sy
    return [dx + k * x, dy - k * y]
  }
  transform.invert = function (x: number, y: number): number[] {
    return [(x - dx) / k * sx, (dy - y) / k * sy]
  }
  return transform
}

function scaleTranslateRotate(k: number, dx: number, dy: number, sx: number, sy: number, alpha: number): GeoRawProjection {
  if (!alpha) return scaleTranslate(k, dx, dy, sx, sy)
  const cosAlpha = cos(alpha),
      sinAlpha = sin(alpha),
      a = cosAlpha * k,
      b = sinAlpha * k,
      ai = cosAlpha / k,
      bi = sinAlpha / k,
      ci = (sinAlpha * dy - cosAlpha * dx) / k,
      fi = (sinAlpha * dx + cosAlpha * dy) / k
  function transform(x: number, y: number): number[] {
    // eslint-disable-next-line pickier/no-unused-vars
    x *= sx
    y *= sy
    return [a * x - b * y + dx, dy - b * x - a * y]
  }
  transform.invert = function (x: number, y: number): number[] {
    return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)]
  }
  return transform
}

export default function projection(project: GeoRawProjection): GeoProjection {
  return projectionMutator(function (): GeoRawProjection { return project })()
}

export function projectionMutator(projectAt: (...args: unknown[]) => GeoRawProjection): (...args: unknown[]) => GeoProjection {
  let project: GeoRawProjection,
      k = 150,
      x = 480, y = 250,
      lambda = 0, phi = 0,
      deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate: GeoRawProjection,
      alpha = 0,
      sx = 1,
      sy = 1,
      theta: number | null = null, preclip: GeoStreamFactory = clipAntimeridian,
      x0: number | null = null, y0: number, x1: number, y1: number, postclip: GeoStreamFactory = identity,
      delta2 = 0.5,
      projectResample: GeoStreamFactory,
      projectTransform: GeoRawProjection,
      projectRotateTransform: GeoRawProjection,
      cache: GeoStream | null,
      cacheStream: GeoStream | null

  function p(point: number[]): number[] {
    return projectRotateTransform(point[0] * radians, point[1] * radians)
  }

  function invert(point: number[]): number[] | null {
    point = projectRotateTransform.invert!(point[0], point[1])
    return point && [point[0] * degrees, point[1] * degrees]
  }

  p.stream = function (stream: GeoStream): GeoStream {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))))
  }

  p.preclip = function (_?: GeoStreamFactory): GeoProjection | GeoStreamFactory {
    return arguments.length ? (preclip = _!, theta = undefined as unknown as number | null, reset()) : preclip
  }

  p.postclip = function (_?: GeoStreamFactory): GeoProjection | GeoStreamFactory {
    return arguments.length ? (postclip = _!, x0 = y0 = x1 = y1 = null!, reset()) : postclip
  }

  p.clipAngle = function (_?: number | null): GeoProjection | number | null {
    return arguments.length ? (preclip = +_! ? clipCircle(theta = _! * radians) : (theta = null, clipAntimeridian), reset()) : theta! * degrees
  }

  p.clipExtent = function (_?: number[][] | null): GeoProjection | number[][] | null {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null!, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]]
  }

  p.scale = function (_?: number): GeoProjection | number {
    return arguments.length ? (k = +_!, recenter()) : k
  }

  p.translate = function (_?: number[]): GeoProjection | number[] {
    return arguments.length ? (x = +_![0], y = +_![1], recenter()) : [x, y]
  }

  p.center = function (_?: number[]): GeoProjection | number[] {
    return arguments.length ? (lambda = _![0] % 360 * radians, phi = _![1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees]
  }

  p.rotate = function (_?: number[]): GeoProjection | number[] {
    return arguments.length ? (deltaLambda = _![0] % 360 * radians, deltaPhi = _![1] % 360 * radians, deltaGamma = _!.length > 2 ? _![2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees]
  }

  p.angle = function (_?: number): GeoProjection | number {
    return arguments.length ? (alpha = _! % 360 * radians, recenter()) : alpha * degrees
  }

  p.reflectX = function (_?: boolean): GeoProjection | boolean {
    return arguments.length ? (sx = _! ? -1 : 1, recenter()) : sx < 0
  }

  p.reflectY = function (_?: boolean): GeoProjection | boolean {
    return arguments.length ? (sy = _! ? -1 : 1, recenter()) : sy < 0
  }

  p.precision = function (_?: number): GeoProjection | number {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _! * _!), reset()) : sqrt(delta2)
  }

  p.fitExtent = function (extent: number[][], object: GeoObject): GeoProjection {
    return fitExtent(p as unknown as GeoProjection, extent, object)
  }

  p.fitSize = function (size: number[], object: GeoObject): GeoProjection {
    return fitSize(p as unknown as GeoProjection, size, object)
  }

  p.fitWidth = function (width: number, object: GeoObject): GeoProjection {
    return fitWidth(p as unknown as GeoProjection, width, object)
  }

  p.fitHeight = function (height: number, object: GeoObject): GeoProjection {
    return fitHeight(p as unknown as GeoProjection, height, object)
  }

  function recenter(): GeoProjection {
    const center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi) as [number, number]),
        transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha)
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma)
    projectTransform = compose(project, transform)
    projectRotateTransform = compose(rotate, projectTransform)
    projectResample = resample(projectTransform, delta2)
    return reset()
  }

  function reset(): GeoProjection {
    cache = cacheStream = null
    return p as unknown as GeoProjection
  }

  return function (this: unknown, ...args: unknown[]): GeoProjection {
    project = projectAt.apply(this, args)
    // eslint-disable-next-line pickier/no-unused-vars
    const pAny = p as unknown as { invert?: (point: number[]) => number[] | null }
    pAny.invert = project.invert && invert
    return recenter()
  }
}
