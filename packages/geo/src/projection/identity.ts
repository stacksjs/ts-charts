import clipRectangle from '../clip/rectangle.ts'
import identity from '../identity.ts'
import { transformer } from '../transform.ts'
import { fitExtent, fitSize, fitWidth, fitHeight } from './fit.ts'
import { cos, degrees, radians, sin } from '../math.ts'

export default function geoIdentity(): any {
  let k = 1, tx = 0, ty = 0, sx = 1, sy = 1,
      alpha = 0, ca: number, sa: number,
      x0: number | null = null, y0: number, x1: number, y1: number,
      kx = 1, ky = 1,
      transform = transformer({
        point: function (this: any, x: number, y: number): void {
          const p = proj([x, y])
          this.stream.point(p[0], p[1])
        }
      }),
      postclip: any = identity,
      cache: any,
      cacheStream: any

  function reset(): any {
    kx = k * sx
    ky = k * sy
    cache = cacheStream = null
    return proj
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

  proj.stream = function (stream: any): any {
    return cache && cacheStream === stream ? cache : cache = transform(postclip(cacheStream = stream))
  }

  proj.postclip = function (_?: any): any {
    return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null as any, reset()) : postclip
  }

  proj.clipExtent = function (_?: any): any {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null as any, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]]
  }

  proj.scale = function (_?: any): any {
    return arguments.length ? (k = +_, reset()) : k
  }

  proj.translate = function (_?: any): any {
    return arguments.length ? (tx = +_[0], ty = +_[1], reset()) : [tx, ty]
  }

  proj.angle = function (_?: any): any {
    return arguments.length ? (alpha = _ % 360 * radians, sa = sin(alpha), ca = cos(alpha), reset()) : alpha * degrees
  }

  proj.reflectX = function (_?: any): any {
    return arguments.length ? (sx = _ ? -1 : 1, reset()) : sx < 0
  }

  proj.reflectY = function (_?: any): any {
    return arguments.length ? (sy = _ ? -1 : 1, reset()) : sy < 0
  }

  proj.fitExtent = function (extent: number[][], object: any): any {
    return fitExtent(proj, extent, object)
  }

  proj.fitSize = function (size: number[], object: any): any {
    return fitSize(proj, size, object)
  }

  proj.fitWidth = function (width: number, object: any): any {
    return fitWidth(proj, width, object)
  }

  proj.fitHeight = function (height: number, object: any): any {
    return fitHeight(proj, height, object)
  }

  return proj
}
