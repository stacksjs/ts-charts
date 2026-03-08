import clipRectangle from '../clip/rectangle.ts'
import identity from '../identity.ts'
import { transformer } from '../transform.ts'
import { fitExtent, fitSize, fitWidth, fitHeight } from './fit.ts'
import { cos, degrees, radians, sin } from '../math.ts'
import type { GeoStream, GeoStreamFactory, GeoProjection, GeoObject, GeoTransformInstance } from '../types.ts'

export default function geoIdentity(): GeoProjection {
  let k = 1, tx = 0, ty = 0, sx = 1, sy = 1,
      alpha = 0, ca: number, sa: number,
      x0: number | null = null, y0: number, x1: number, y1: number,
      kx = 1, ky = 1,
      transform: GeoStreamFactory = transformer({
        point: function (this: GeoTransformInstance, x: number, y: number): void {
          const p = proj([x, y])
          this.stream.point(p[0], p[1])
        }
      }),
      postclip: GeoStreamFactory = identity,
      cache: GeoStream | null,
      cacheStream: GeoStream | null

  function reset(): GeoProjection {
    kx = k * sx
    ky = k * sy
    cache = cacheStream = null
    return proj as unknown as GeoProjection
  }

  function proj(p: number[]): number[] {
    let x = p[0] * kx, y = p[1] * ky
    if (alpha) {
      const t = y * ca - x * sa
      x = x * ca + y * sa
      y = t
    }
    return [x + tx, y + ty]
  }

  proj.invert = function (p: number[]): number[] {
    let x = p[0] - tx, y = p[1] - ty
    if (alpha) {
      const t = y * ca + x * sa
      x = x * ca - y * sa
      y = t
    }
    return [x / kx, y / ky]
  }

  proj.stream = function (stream: GeoStream): GeoStream {
    return cache && cacheStream === stream ? cache : cache = transform(postclip(cacheStream = stream))
  }

  proj.postclip = function (_?: GeoStreamFactory): GeoProjection | GeoStreamFactory {
    return arguments.length ? (postclip = _!, x0 = y0 = x1 = y1 = null!, reset()) : postclip
  }

  proj.clipExtent = function (_?: number[][] | null): GeoProjection | number[][] | null {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null!, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]]
  }

  proj.scale = function (_?: number): GeoProjection | number {
    return arguments.length ? (k = +_!, reset()) : k
  }

  proj.translate = function (_?: number[]): GeoProjection | number[] {
    return arguments.length ? (tx = +_![0], ty = +_![1], reset()) : [tx, ty]
  }

  proj.angle = function (_?: number): GeoProjection | number {
    return arguments.length ? (alpha = _! % 360 * radians, sa = sin(alpha), ca = cos(alpha), reset()) : alpha * degrees
  }

  proj.reflectX = function (_?: boolean): GeoProjection | boolean {
    return arguments.length ? (sx = _! ? -1 : 1, reset()) : sx < 0
  }

  proj.reflectY = function (_?: boolean): GeoProjection | boolean {
    return arguments.length ? (sy = _! ? -1 : 1, reset()) : sy < 0
  }

  proj.fitExtent = function (extent: number[][], object: GeoObject): GeoProjection {
    return fitExtent(proj as unknown as GeoProjection, extent, object)
  }

  proj.fitSize = function (size: number[], object: GeoObject): GeoProjection {
    return fitSize(proj as unknown as GeoProjection, size, object)
  }

  proj.fitWidth = function (width: number, object: GeoObject): GeoProjection {
    return fitWidth(proj as unknown as GeoProjection, width, object)
  }

  proj.fitHeight = function (height: number, object: GeoObject): GeoProjection {
    return fitHeight(proj as unknown as GeoProjection, height, object)
  }

  return proj as unknown as GeoProjection
}
