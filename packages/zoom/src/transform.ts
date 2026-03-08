export interface TransformInstance {
  k: number
  x: number
  y: number
  scale(k: number): TransformInstance
  translate(x: number, y: number): TransformInstance
  apply(point: [number, number]): [number, number]
  applyX(x: number): number
  applyY(y: number): number
  invert(location: [number, number]): [number, number]
  invertX(x: number): number
  invertY(y: number): number
  rescaleX(x: ContinuousScale): ContinuousScale
  rescaleY(y: ContinuousScale): ContinuousScale
  toString(): string
}

interface ContinuousScale {
  copy(): ContinuousScale
  domain(d?: number[]): ContinuousScale & number[]
  range(): number[]
  invert(value: number): number
}

export function Transform(this: TransformInstance, k: number, x: number, y: number): void {
  this.k = k
  this.x = x
  this.y = y
}

Transform.prototype = {
  constructor: Transform,
  scale(this: TransformInstance, k: number): TransformInstance {
    return k === 1 ? this : new (Transform as unknown as new (k: number, x: number, y: number) => TransformInstance)(this.k * k, this.x, this.y)
  },
  translate(this: TransformInstance, x: number, y: number): TransformInstance {
    return x === 0 && y === 0 ? this : new (Transform as unknown as new (k: number, x: number, y: number) => TransformInstance)(this.k, this.x + this.k * x, this.y + this.k * y)
  },
  apply(this: TransformInstance, point: [number, number]): [number, number] {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y]
  },
  applyX(this: TransformInstance, x: number): number {
    return x * this.k + this.x
  },
  applyY(this: TransformInstance, y: number): number {
    return y * this.k + this.y
  },
  invert(this: TransformInstance, location: [number, number]): [number, number] {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k]
  },
  invertX(this: TransformInstance, x: number): number {
    return (x - this.x) / this.k
  },
  invertY(this: TransformInstance, y: number): number {
    return (y - this.y) / this.k
  },
  rescaleX(this: TransformInstance, x: ContinuousScale): ContinuousScale {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x))
  },
  rescaleY(this: TransformInstance, y: ContinuousScale): ContinuousScale {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y))
  },
  toString(this: TransformInstance): string {
    return 'translate(' + this.x + ',' + this.y + ') scale(' + this.k + ')'
  },
}

export const identity: TransformInstance = new (Transform as unknown as new (k: number, x: number, y: number) => TransformInstance)(1, 0, 0)

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts DOM nodes with optional __zoom property
interface TransformFunction {
  (node: any): TransformInstance
  prototype: typeof Transform.prototype
}

const transform: TransformFunction = Object.assign(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DOM node with expando properties
  function transform(node: any): TransformInstance {
    while (!node.__zoom) if (!(node = node.parentNode!)) return identity
    return node.__zoom
  },
  { prototype: Transform.prototype }
)

export default transform
