import type { QuadtreeNode } from './types.ts'

export class Quad<T> {
  node: QuadtreeNode<T> | undefined
  x0: number
  y0: number
  x1: number
  y1: number

  constructor(node: QuadtreeNode<T> | undefined, x0: number, y0: number, x1: number, y1: number) {
    this.node = node
    this.x0 = x0
    this.y0 = y0
    this.x1 = x1
    this.y1 = y1
  }
}
