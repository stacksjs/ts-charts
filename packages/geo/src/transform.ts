export default function geoTransform(methods: any): any {
  return {
    stream: transformer(methods)
  }
}

export function transformer(methods: any): (stream: any) => any {
  return function (stream: any): any {
    const s: any = new TransformStream()
    for (const key in methods) s[key] = methods[key]
    s.stream = stream
    return s
  }
}

function TransformStream(this: any): void {}

TransformStream.prototype = {
  constructor: TransformStream,
  point: function (this: any, x: number, y: number): void { this.stream.point(x, y) },
  sphere: function (this: any): void { this.stream.sphere() },
  lineStart: function (this: any): void { this.stream.lineStart() },
  lineEnd: function (this: any): void { this.stream.lineEnd() },
  polygonStart: function (this: any): void { this.stream.polygonStart() },
  polygonEnd: function (this: any): void { this.stream.polygonEnd() }
}
