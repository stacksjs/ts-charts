import { epsilon } from '../math.ts'
import geoAlbers from './albers.ts'
import geoConicEqualArea from './conicEqualArea.ts'
import { fitExtent, fitSize, fitWidth, fitHeight } from './fit.ts'

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex(streams: any[]): any {
  const n = streams.length
  return {
    point: function (x: number, y: number): void { let i = -1; while (++i < n) streams[i].point(x, y) },
    sphere: function (): void { let i = -1; while (++i < n) streams[i].sphere() },
    lineStart: function (): void { let i = -1; while (++i < n) streams[i].lineStart() },
    lineEnd: function (): void { let i = -1; while (++i < n) streams[i].lineEnd() },
    polygonStart: function (): void { let i = -1; while (++i < n) streams[i].polygonStart() },
    polygonEnd: function (): void { let i = -1; while (++i < n) streams[i].polygonEnd() }
  }
}

// A composite projection for the United States, configured by default for
// 960x500. The projection also works quite well at 960x600 if you change the
// scale to 1285 and adjust the translate accordingly.
export default function geoAlbersUsa(): any {
  let cache: any,
      cacheStream: any,
      lower48 = geoAlbers(), lower48Point: any,
      alaska = geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint: any,
      hawaii = geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint: any,
      point: any, pointStream = { point: function (x: number, y: number): void { point = [x, y] } }

  function albersUsa(coordinates: number[]): any {
    const x = coordinates[0], y = coordinates[1]
    return point = null,
        (lower48Point.point(x, y), point)
        || (alaskaPoint.point(x, y), point)
        || (hawaiiPoint.point(x, y), point)
  }

  albersUsa.invert = function (coordinates: number[]): any {
    const k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : lower48).invert(coordinates)
  }

  albersUsa.stream = function (stream: any): any {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)])
  }

  albersUsa.precision = function (_?: any): any {
    if (!arguments.length) return lower48.precision()
    lower48.precision(_), alaska.precision(_), hawaii.precision(_)
    return reset()
  }

  albersUsa.scale = function (_?: any): any {
    if (!arguments.length) return lower48.scale()
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_)
    return albersUsa.translate(lower48.translate())
  }

  albersUsa.translate = function (_?: any): any {
    if (!arguments.length) return lower48.translate()
    const k = lower48.scale(), x = +_[0], y = +_[1]

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream)

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream)

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.212 * k])
        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream)

    return reset()
  }

  albersUsa.fitExtent = function (extent: number[][], object: any): any {
    return fitExtent(albersUsa, extent, object)
  }

  albersUsa.fitSize = function (size: number[], object: any): any {
    return fitSize(albersUsa, size, object)
  }

  albersUsa.fitWidth = function (width: number, object: any): any {
    return fitWidth(albersUsa, width, object)
  }

  albersUsa.fitHeight = function (height: number, object: any): any {
    return fitHeight(albersUsa, height, object)
  }

  function reset(): any {
    cache = cacheStream = null
    return albersUsa
  }

  return albersUsa.scale(1070)
}
