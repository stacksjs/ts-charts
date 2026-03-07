import geoStream from '../stream.ts'
import boundsStream from '../path/bounds.ts'

function fit(projection: any, fitBounds: (b: number[][]) => void, object: any): any {
  const clip = projection.clipExtent && projection.clipExtent()
  projection.scale(150).translate([0, 0])
  if (clip != null) projection.clipExtent(null)
  geoStream(object, projection.stream(boundsStream))
  fitBounds(boundsStream.result())
  if (clip != null) projection.clipExtent(clip)
  return projection
}

export function fitExtent(projection: any, extent: number[][], object: any): any {
  return fit(projection, function (b: number[][]): void {
    const w = extent[1][0] - extent[0][0],
        h = extent[1][1] - extent[0][1],
        k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
        x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
        y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2
    projection.scale(150 * k).translate([x, y])
  }, object)
}

export function fitSize(projection: any, size: number[], object: any): any {
  return fitExtent(projection, [[0, 0], size], object)
}

export function fitWidth(projection: any, width: number, object: any): any {
  return fit(projection, function (b: number[][]): void {
    const w = +width,
        k = w / (b[1][0] - b[0][0]),
        x = (w - k * (b[1][0] + b[0][0])) / 2,
        y = -k * b[0][1]
    projection.scale(150 * k).translate([x, y])
  }, object)
}

export function fitHeight(projection: any, height: number, object: any): any {
  return fit(projection, function (b: number[][]): void {
    const h = +height,
        k = h / (b[1][1] - b[0][1]),
        x = -k * b[0][0],
        y = (h - k * (b[1][1] + b[0][1])) / 2
    projection.scale(150 * k).translate([x, y])
  }, object)
}
