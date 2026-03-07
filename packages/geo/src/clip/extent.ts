import clipRectangle from './rectangle.ts'

export default function clipExtent(): any {
  let x0 = 0,
      y0 = 0,
      x1 = 960,
      y1 = 500,
      cache: any,
      cacheStream: any,
      clipObj: any

  return clipObj = {
    stream: function (stream: any): any {
      return cache && cacheStream === stream ? cache : cache = clipRectangle(x0, y0, x1, y1)(cacheStream = stream)
    },
    extent: function (_?: any): any {
      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clipObj) : [[x0, y0], [x1, y1]]
    }
  }
}
