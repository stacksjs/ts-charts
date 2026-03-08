import clipRectangle from './rectangle.ts'
import type { GeoStream } from '../types.ts'

interface ClipExtentObj {
  stream(stream: GeoStream): GeoStream
  extent(_?: number[][]): ClipExtentObj | number[][]
}

export default function clipExtent(): ClipExtentObj {
  let x0 = 0,
      y0 = 0,
      x1 = 960,
      y1 = 500,
      cache: GeoStream | null,
      cacheStream: GeoStream | null,
      clipObj: ClipExtentObj

  return clipObj = {
    stream: function (stream: GeoStream): GeoStream {
      return cache && cacheStream === stream ? cache : cache = clipRectangle(x0, y0, x1, y1)(cacheStream = stream)
    },
    extent: function (_?: number[][]): ClipExtentObj | number[][] {
      return arguments.length ? (x0 = +_![0][0], y0 = +_![0][1], x1 = +_![1][0], y1 = +_![1][1], cache = cacheStream = null, clipObj) : [[x0, y0], [x1, y1]]
    }
  }
}
