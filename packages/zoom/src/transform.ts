export function Transform(this: any, k: number, x: number, y: number): void {
  this.k = k
  this.x = x
  this.y = y
}

Transform.prototype = {
  constructor: Transform,
  scale(this: any, k: number): any {
    return k === 1 ? this : new (Transform as any)(this.k * k, this.x, this.y)
  },
  translate(this: any, x: number, y: number): any {
    return x === 0 && y === 0 ? this : new (Transform as any)(this.k, this.x + this.k * x, this.y + this.k * y)
  },
  apply(this: any, point: [number, number]): [number, number] {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y]
  },
  applyX(this: any, x: number): number {
    return x * this.k + this.x
  },
  applyY(this: any, y: number): number {
    return y * this.k + this.y
  },
  invert(this: any, location: [number, number]): [number, number] {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k]
  },
  invertX(this: any, x: number): number {
    return (x - this.x) / this.k
  },
  invertY(this: any, y: number): number {
    return (y - this.y) / this.k
  },
  rescaleX(this: any, x: any): any {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x))
  },
  rescaleY(this: any, y: any): any {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y))
  },
  toString(this: any): string {
    return 'translate(' + this.x + ',' + this.y + ') scale(' + this.k + ')'
  },
}

export const identity: any = new (Transform as any)(1, 0, 0)

interface TransformFunction {
  (node: any): any
  prototype: typeof Transform.prototype
}

const transform: TransformFunction = Object.assign(
  function transform(node: any): any {
    while (!node.__zoom) if (!(node = node.parentNode)) return identity
    return node.__zoom
  },
  { prototype: Transform.prototype }
)

export default transform
