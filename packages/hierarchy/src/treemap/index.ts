import roundNode from './round.ts'
import squarify from './squarify.ts'
import { required } from '../accessors.ts'
import constant, { constantZero } from '../constant.ts'
import type { HierarchyNode } from '../hierarchy/index.ts'
import type { TileParent, TileNode } from './dice.ts'

export interface TreemapLayout<T> {
  (root: HierarchyNode<T>): HierarchyNode<T>
  tile(): (parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number) => void
  tile(tile: (parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number) => void): TreemapLayout<T>
  round(): boolean
  round(round: boolean): TreemapLayout<T>
  size(): [number, number]
  size(size: [number, number]): TreemapLayout<T>
  padding(): (node: HierarchyNode<T>) => number
  padding(padding: number | ((node: HierarchyNode<T>) => number)): TreemapLayout<T>
  paddingInner(): (node: HierarchyNode<T>) => number
  paddingInner(padding: number | ((node: HierarchyNode<T>) => number)): TreemapLayout<T>
  paddingOuter(): (node: HierarchyNode<T>) => number
  paddingOuter(padding: number | ((node: HierarchyNode<T>) => number)): TreemapLayout<T>
  paddingTop(): (node: HierarchyNode<T>) => number
  paddingTop(padding: number | ((node: HierarchyNode<T>) => number)): TreemapLayout<T>
  paddingRight(): (node: HierarchyNode<T>) => number
  paddingRight(padding: number | ((node: HierarchyNode<T>) => number)): TreemapLayout<T>
  paddingBottom(): (node: HierarchyNode<T>) => number
  paddingBottom(padding: number | ((node: HierarchyNode<T>) => number)): TreemapLayout<T>
  paddingLeft(): (node: HierarchyNode<T>) => number
  paddingLeft(padding: number | ((node: HierarchyNode<T>) => number)): TreemapLayout<T>
}

export default function treemap<T>(): TreemapLayout<T> {
  let tile: any = squarify
  let round = false
  let dx = 1
  let dy = 1
  let paddingStack: number[] = [0]
  let paddingInner: (node: HierarchyNode<T>) => number = constantZero as any
  let paddingTop: (node: HierarchyNode<T>) => number = constantZero as any
  let paddingRight: (node: HierarchyNode<T>) => number = constantZero as any
  let paddingBottom: (node: HierarchyNode<T>) => number = constantZero as any
  let paddingLeft: (node: HierarchyNode<T>) => number = constantZero as any

  function treemap(root: HierarchyNode<T>): HierarchyNode<T> {
    root.x0 =
    root.y0 = 0
    root.x1 = dx
    root.y1 = dy
    root.eachBefore(positionNode)
    paddingStack = [0]
    if (round) root.eachBefore(roundNode as any)
    return root
  }

  function positionNode(node: HierarchyNode<T>): void {
    let p = paddingStack[node.depth]
    let x0 = node.x0! + p
    let y0 = node.y0! + p
    let x1 = node.x1! - p
    let y1 = node.y1! - p
    if (x1 < x0) x0 = x1 = (x0 + x1) / 2
    if (y1 < y0) y0 = y1 = (y0 + y1) / 2
    node.x0 = x0
    node.y0 = y0
    node.x1 = x1
    node.y1 = y1
    if (node.children) {
      p = paddingStack[node.depth + 1] = paddingInner(node) / 2
      x0 += paddingLeft(node) - p
      y0 += paddingTop(node) - p
      x1 -= paddingRight(node) - p
      y1 -= paddingBottom(node) - p
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2
      tile(node, x0, y0, x1, y1)
    }
  }

  treemap.round = function (x?: boolean): any {
    return arguments.length ? (round = !!x, treemap) : round
  }

  treemap.size = function (x?: [number, number]): any {
    return arguments.length ? (dx = +x![0], dy = +x![1], treemap) : [dx, dy]
  }

  treemap.tile = function (x?: any): any {
    return arguments.length ? (tile = required(x), treemap) : tile
  }

  treemap.padding = function (x?: any): any {
    return arguments.length ? treemap.paddingInner(x).paddingOuter(x) : treemap.paddingInner()
  }

  treemap.paddingInner = function (x?: any): any {
    return arguments.length ? (paddingInner = typeof x === 'function' ? x : constant(+x) as any, treemap) : paddingInner
  }

  treemap.paddingOuter = function (x?: any): any {
    return arguments.length ? treemap.paddingTop(x).paddingRight(x).paddingBottom(x).paddingLeft(x) : treemap.paddingTop()
  }

  treemap.paddingTop = function (x?: any): any {
    return arguments.length ? (paddingTop = typeof x === 'function' ? x : constant(+x) as any, treemap) : paddingTop
  }

  treemap.paddingRight = function (x?: any): any {
    return arguments.length ? (paddingRight = typeof x === 'function' ? x : constant(+x) as any, treemap) : paddingRight
  }

  treemap.paddingBottom = function (x?: any): any {
    return arguments.length ? (paddingBottom = typeof x === 'function' ? x : constant(+x) as any, treemap) : paddingBottom
  }

  treemap.paddingLeft = function (x?: any): any {
    return arguments.length ? (paddingLeft = typeof x === 'function' ? x : constant(+x) as any, treemap) : paddingLeft
  }

  return treemap as TreemapLayout<T>
}
