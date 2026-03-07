import type { TileParent, TileNode } from './dice.ts'

export default function treemapSlice(parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number): void {
  const nodes = parent.children!
  let node: TileNode
  let i = -1
  const n = nodes.length
  const k = parent.value && (y1 - y0) / parent.value

  while (++i < n) {
    node = nodes[i]
    node.x0 = x0
    node.x1 = x1
    node.y0 = y0
    node.y1 = y0 += node.value! * k!
  }
}
