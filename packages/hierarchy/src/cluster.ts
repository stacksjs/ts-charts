import type { HierarchyNode } from './hierarchy/index.ts'

function defaultSeparation<T>(a: HierarchyNode<T>, b: HierarchyNode<T>): number {
  return a.parent === b.parent ? 1 : 2
}

function meanX<T>(children: HierarchyNode<T>[]): number {
  return children.reduce(meanXReduce, 0) / children.length
}

function meanXReduce<T>(x: number, c: HierarchyNode<T>): number {
  return x + c.x!
}

function maxY<T>(children: HierarchyNode<T>[]): number {
  return 1 + children.reduce(maxYReduce, 0)
}

function maxYReduce<T>(y: number, c: HierarchyNode<T>): number {
  return Math.max(y, c.y!)
}

function leafLeft<T>(node: HierarchyNode<T>): HierarchyNode<T> {
  let children: HierarchyNode<T>[] | undefined
  while (children = node.children) node = children[0]
  return node
}

function leafRight<T>(node: HierarchyNode<T>): HierarchyNode<T> {
  let children: HierarchyNode<T>[] | undefined
  while (children = node.children) node = children[children.length - 1]
  return node
}

export interface ClusterLayout<T> {
  (root: HierarchyNode<T>): HierarchyNode<T>
  separation(): (a: HierarchyNode<T>, b: HierarchyNode<T>) => number
  separation(separation: (a: HierarchyNode<T>, b: HierarchyNode<T>) => number): ClusterLayout<T>
  size(): [number, number] | null
  size(size: [number, number]): ClusterLayout<T>
  nodeSize(): [number, number] | null
  nodeSize(size: [number, number]): ClusterLayout<T>
}

export default function cluster<T>(): ClusterLayout<T> {
  let separation: (a: HierarchyNode<T>, b: HierarchyNode<T>) => number = defaultSeparation
  let dx = 1
  let dy = 1
  let nodeSize = false

  function cluster(root: HierarchyNode<T>): HierarchyNode<T> {
    let previousNode: HierarchyNode<T> | undefined
    let x = 0

    // First walk, computing the initial x & y values.
    root.eachAfter(function (node) {
      const children = node.children
      if (children) {
        node.x = meanX(children)
        node.y = maxY(children)
      } else {
        node.x = previousNode ? x += separation(node, previousNode) : 0
        node.y = 0
        previousNode = node
      }
    })

    const left = leafLeft(root)
    const right = leafRight(root)
    const x0 = left.x! - separation(left, right) / 2
    const x1 = right.x! + separation(right, left) / 2

    // Second walk, normalizing x & y to the desired size.
    return root.eachAfter(nodeSize ? function (node) {
      node.x = (node.x! - root.x!) * dx
      node.y = (root.y! - node.y!) * dy
    } : function (node) {
      node.x = (node.x! - x0) / (x1 - x0) * dx
      node.y = (1 - (root.y ? node.y! / root.y! : 1)) * dy
    })
  }

  cluster.separation = function (x?: (a: HierarchyNode<T>, b: HierarchyNode<T>) => number): typeof separation | ClusterLayout<T> {
    return arguments.length ? (separation = x!, cluster as ClusterLayout<T>) : separation
  }

  cluster.size = function (x?: [number, number]): [number, number] | null | ClusterLayout<T> {
    return arguments.length ? (nodeSize = false, dx = +x![0], dy = +x![1], cluster as ClusterLayout<T>) : (nodeSize ? null : [dx, dy])
  }

  cluster.nodeSize = function (x?: [number, number]): [number, number] | null | ClusterLayout<T> {
    return arguments.length ? (nodeSize = true, dx = +x![0], dy = +x![1], cluster as ClusterLayout<T>) : (nodeSize ? [dx, dy] : null)
  }

  return cluster as ClusterLayout<T>
}
