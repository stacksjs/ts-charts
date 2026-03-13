import { epsilon } from '../math.ts'
import geoAlbers from './albers.ts'
import geoConicEqualArea from './conicEqualArea.ts'
import { fitExtent, fitSize, fitWidth, fitHeight } from './fit.ts'
import type { GeoStream, GeoObject, GeoProjection } from '../types.ts'

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex(streams: GeoStream[]): GeoStream {
  const n = streams.length
  return {
    point: function (x: number, y: number): void {
      let i = -1
      while (++i < n) streams[i].point(x, y)
    },
    sphere: function (): void {
      let i = -1
      while (++i < n) streams[i].sphere!()
    },
    lineStart: function (): void {
      let i = -1
      while (++i < n) streams[i].lineStart()
    },
    lineEnd: function (): void {
      let i = -1
      while (++i < n) streams[i].lineEnd()
    },
    polygonStart: function (): void {
      let i = -1
      while (++i < n) streams[i].polygonStart()
    },
    polygonEnd: function (): void {
      let i = -1
      while (++i < n) streams[i].polygonEnd()
    }
  }
}

// A composite projection for the United States, configured by default for
// 960x500. The projection also works quite well at 960x600 if you change the
// scale to 1285 and adjust the translate accordingly.
export default function geoAlbersUsa(): GeoProjection {
  let cache: GeoStream | null,
      cacheStream: GeoStream | null,
      lower48 = geoAlbers(), lower48Point: GeoStream,
      alaska = geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]) as GeoProjection, alaskaPoint: GeoStream,
      hawaii = geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]) as GeoProjection, hawaiiPoint: GeoStream,
      // eslint-disable-next-line pickier/no-unused-vars
      point: number[] | null, pointStream: GeoStream = { point: function (x: number, y: number): void { point = [x, y] }, lineStart(): void {}, lineEnd(): void {}, polygonStart(): void {}, polygonEnd(): void {} }

  function albersUsa(coordinates: number[]): number[] | null {
    const x = coordinates[0], y = coordinates[1]
    return point = null,
        (lower48Point.point(x, y), point)
        || (alaskaPoint.point(x, y), point)
        || (hawaiiPoint.point(x, y), point)
  }

  albersUsa.invert = function (coordinates: number[]): number[] | null {
    const k = lower48.scale() as number,
        t = lower48.translate() as number[],
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : lower48).invert!(coordinates)
  }

  albersUsa.stream = function (stream: GeoStream): GeoStream {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)])
  }

  albersUsa.precision = function (_?: number): GeoProjection | number {
    if (!arguments.length) return lower48.precision() as number
    lower48.precision(_!), alaska.precision(_!), hawaii.precision(_!)
    return reset()
  }

  albersUsa.scale = function (_?: number): GeoProjection | number {
    if (!arguments.length) return lower48.scale() as number
    lower48.scale(_!), alaska.scale(_! * 0.35), hawaii.scale(_!)
    return albersUsa.translate(lower48.translate() as number[]) as GeoProjection
  }

  albersUsa.translate = function (_?: number[]): GeoProjection | number[] {
    if (!arguments.length) return lower48.translate() as number[]
    const k = lower48.scale() as number, x = +_![0], y = +_![1]

    lower48Point = lower48
        .translate(_!)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream) as GeoStream

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream) as GeoStream

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.212 * k])
        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream) as GeoStream

    return reset()
  }

  albersUsa.fitExtent = function (extent: number[][], object: GeoObject): GeoProjection {
    return fitExtent(albersUsa as unknown as GeoProjection, extent, object)
  }

  albersUsa.fitSize = function (size: number[], object: GeoObject): GeoProjection {
    return fitSize(albersUsa as unknown as GeoProjection, size, object)
  }

  albersUsa.fitWidth = function (width: number, object: GeoObject): GeoProjection {
    return fitWidth(albersUsa as unknown as GeoProjection, width, object)
  }

  albersUsa.fitHeight = function (height: number, object: GeoObject): GeoProjection {
    return fitHeight(albersUsa as unknown as GeoProjection, height, object)
  }

  function reset(): GeoProjection {
    cache = cacheStream = null
    return albersUsa as unknown as GeoProjection
  }

  return albersUsa.scale(1070) as GeoProjection
}
