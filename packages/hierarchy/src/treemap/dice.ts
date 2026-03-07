export interface TileParent {
  children?: TileNode[]
  value?: number
}

export interface TileNode {
  x0?: number
  y0?: number
  x1?: number
  y1?: number
  value?: number
  depth?: number
}

export default function treemapDice(parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number): void {
  const nodes = parent.children!
  let node: TileNode
  let i = -1
  const n = nodes.length
  const k = parent.value && (x1 - x0) / parent.value

  while (++i < n) {
    node = nodes[i]
    node.y0 = y0
    node.y1 = y1
    node.x0 = x0
    node.x1 = x0 += node.value! * k!
  }
}
