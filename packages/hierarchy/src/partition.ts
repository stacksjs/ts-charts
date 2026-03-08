import type { HierarchyNode } from './hierarchy/index.ts'
import roundNode from './treemap/round.ts'
import treemapDice from './treemap/dice.ts'

export interface PartitionLayout<T> {
  (root: HierarchyNode<T>): HierarchyNode<T>
  round(): boolean
  round(round: boolean): PartitionLayout<T>
  size(): [number, number]
  size(size: [number, number]): PartitionLayout<T>
  padding(): number
  padding(padding: number): PartitionLayout<T>
}

export default function partition<T>(): PartitionLayout<T> {
  let dx = 1
  let dy = 1
  let padding = 0
  let round = false

  function partition(root: HierarchyNode<T>): HierarchyNode<T> {
    const n = root.height + 1
    root.x0 =
    root.y0 = padding
    root.x1 = dx
    root.y1 = dy / n
    root.eachBefore(positionNode(dy, n))
    if (round) root.eachBefore(roundNode)
    return root
  }

  function positionNode(dy: number, n: number): (node: HierarchyNode<T>) => void {
    return function (node: HierarchyNode<T>): void {
      if (node.children) {
        treemapDice(node as any, node.x0!, dy * (node.depth + 1) / n, node.x1!, dy * (node.depth + 2) / n)
      }
      let x0 = node.x0!
      let y0 = node.y0!
      let x1 = node.x1! - padding
      let y1 = node.y1! - padding
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2
      node.x0 = x0
      node.y0 = y0
      node.x1 = x1
      node.y1 = y1
    }
  }

  partition.round = function (x?: boolean): boolean | PartitionLayout<T> {
    return arguments.length ? (round = !!x, partition as PartitionLayout<T>) : round
  }

  partition.size = function (x?: [number, number]): [number, number] | PartitionLayout<T> {
    return arguments.length ? (dx = +x![0], dy = +x![1], partition as PartitionLayout<T>) : [dx, dy]
  }

  partition.padding = function (x?: number): number | PartitionLayout<T> {
    return arguments.length ? (padding = +x!, partition as PartitionLayout<T>) : padding
  }

  return partition as PartitionLayout<T>
}
