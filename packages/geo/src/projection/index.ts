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

const transformRadians: any = transformer({
  point: function (this: any, x: number, y: number): void {
    this.stream.point(x * radians, y * radians)
  }
})

function transformRotate(rotate: any): any {
  return transformer({
    point: function (this: any, x: number, y: number): void {
      const r = rotate(x, y)
      return this.stream.point(r[0], r[1])
    }
  })
}

function scaleTranslate(k: number, dx: number, dy: number, sx: number, sy: number): any {
  function transform(x: number, y: number): number[] {
    x *= sx; y *= sy
    return [dx + k * x, dy - k * y]
  }
  transform.invert = function (x: number, y: number): number[] {
    return [(x - dx) / k * sx, (dy - y) / k * sy]
  }
  return transform
}

function scaleTranslateRotate(k: number, dx: number, dy: number, sx: number, sy: number, alpha: number): any {
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
    x *= sx; y *= sy
    return [a * x - b * y + dx, dy - b * x - a * y]
  }
  transform.invert = function (x: number, y: number): number[] {
    return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)]
  }
  return transform
}

export default function projection(project: any): any {
  return projectionMutator(function (): any { return project })()
}

export function projectionMutator(projectAt: any): any {
  let project: any,
      k = 150,
      x = 480, y = 250,
      lambda = 0, phi = 0,
      deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate: any,
      alpha = 0,
      sx = 1,
      sy = 1,
      theta: any = null, preclip: any = clipAntimeridian,
      x0: number | null = null, y0: number, x1: number, y1: number, postclip: any = identity,
      delta2 = 0.5,
      projectResample: any,
      projectTransform: any,
      projectRotateTransform: any,
      cache: any,
      cacheStream: any

  function p(point: number[]): any {
    return projectRotateTransform(point[0] * radians, point[1] * radians)
  }

  function invert(point: number[]): any {
    point = projectRotateTransform.invert(point[0], point[1])
    return point && [point[0] * degrees, point[1] * degrees]
  }

  p.stream = function (stream: any): any {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))))
  }

  p.preclip = function (_?: any): any {
    return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip
  }

  p.postclip = function (_?: any): any {
    return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null as any, reset()) : postclip
  }

  p.clipAngle = function (_?: any): any {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees
  }

  p.clipExtent = function (_?: any): any {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null as any, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]]
  }

  p.scale = function (_?: any): any {
    return arguments.length ? (k = +_, recenter()) : k
  }

  p.translate = function (_?: any): any {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y]
  }

  p.center = function (_?: any): any {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees]
  }

  p.rotate = function (_?: any): any {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees]
  }

  p.angle = function (_?: any): any {
    return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees
  }

  p.reflectX = function (_?: any): any {
    return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0
  }

  p.reflectY = function (_?: any): any {
    return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0
  }

  p.precision = function (_?: any): any {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2)
  }

  p.fitExtent = function (extent: number[][], object: any): any {
    return fitExtent(p, extent, object)
  }

  p.fitSize = function (size: number[], object: any): any {
    return fitSize(p, size, object)
  }

  p.fitWidth = function (width: number, object: any): any {
    return fitWidth(p, width, object)
  }

  p.fitHeight = function (height: number, object: any): any {
    return fitHeight(p, height, object)
  }

  function recenter(): any {
    const center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
        transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha)
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma)
    projectTransform = compose(project, transform)
    projectRotateTransform = compose(rotate, projectTransform)
    projectResample = resample(projectTransform, delta2)
    return reset()
  }

  function reset(): any {
    cache = cacheStream = null
    return p
  }

  return function (this: any, ...args: any[]): any {
    project = projectAt.apply(this, args)
    ;(p as any).invert = project.invert && invert
    return recenter()
  }
}
