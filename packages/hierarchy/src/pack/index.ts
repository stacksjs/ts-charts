import { optional } from '../accessors.ts'
import constant, { constantZero } from '../constant.ts'
import lcg from '../lcg.ts'
import { packSiblingsRandom } from './siblings.ts'
import type { HierarchyNode } from '../hierarchy/index.ts'

function defaultRadius<T>(d: HierarchyNode<T>): number {
  return Math.sqrt(d.value!)
}

export interface PackLayout<T> {
  (root: HierarchyNode<T>): HierarchyNode<T>
  // eslint-disable-next-line pickier/no-unused-vars
  radius(): ((node: HierarchyNode<T>) => number) | null
  radius(radius: (node: HierarchyNode<T>) => number): PackLayout<T>
  size(): [number, number]
  size(size: [number, number]): PackLayout<T>
  padding(): (node: HierarchyNode<T>) => number
  // eslint-disable-next-line pickier/no-unused-vars
  padding(padding: number | ((node: HierarchyNode<T>) => number)): PackLayout<T>
}

export default function pack<T>(): PackLayout<T> {
  // eslint-disable-next-line pickier/no-unused-vars
  let radius: ((node: HierarchyNode<T>) => number) | null = null
  let dx = 1
  let dy = 1
  let padding: (node: HierarchyNode<T>) => number = constantZero as unknown as (node: HierarchyNode<T>) => number

  function pack(root: HierarchyNode<T>): HierarchyNode<T> {
    const random = lcg()
    root.x = dx / 2
    root.y = dy / 2
    if (radius) {
      root.eachBefore(radiusLeaf(radius))
          .eachAfter(packChildrenRandom(padding, 0.5, random))
          .eachBefore(translateChild(1))
    // eslint-disable-next-line pickier/no-unused-vars
    } else {
      root.eachBefore(radiusLeaf(defaultRadius))
          // eslint-disable-next-line pickier/no-unused-vars
          .eachAfter(packChildrenRandom(constantZero as unknown as (node: HierarchyNode<T>) => number, 1, random))
          .eachAfter(packChildrenRandom(padding, root.r! / Math.min(dx, dy), random))
          .eachBefore(translateChild(Math.min(dx, dy) / (2 * root.r!)))
    }
    return root
  }

  pack.radius = function (x?: (node: HierarchyNode<T>) => number): typeof radius | PackLayout<T> {
    return arguments.length ? (radius = optional(x!) as typeof radius, pack as PackLayout<T>) : radius
  }

  pack.size = function (x?: [number, number]): [number, number] | PackLayout<T> {
    return arguments.length ? (dx = +x![0], dy = +x![1], pack as PackLayout<T>) : [dx, dy]
  }

  pack.padding = function (x?: number | ((node: HierarchyNode<T>) => number)): typeof padding | PackLayout<T> {
    // eslint-disable-next-line pickier/no-unused-vars
    return arguments.length ? (padding = typeof x === 'function' ? x : constant(+x!) as unknown as (node: HierarchyNode<T>) => number, pack as PackLayout<T>) : padding
  }

  return pack as PackLayout<T>
}

function radiusLeaf<T>(radius: (node: HierarchyNode<T>) => number): (node: HierarchyNode<T>) => void {
  return function (node: HierarchyNode<T>): void {
    if (!node.children) {
      node.r = Math.max(0, +radius(node) || 0)
    }
  }
}

function packChildrenRandom<T>(padding: (node: HierarchyNode<T>) => number, k: number, random: () => number): (node: HierarchyNode<T>) => void {
  return function (node: HierarchyNode<T>): void {
    const children = node.children
    if (children) {
      let i: number
      const n = children.length
      const r = padding(node) * k || 0
      let e: number

      if (r) for (i = 0; i < n; ++i) children[i].r! += r
      e = packSiblingsRandom(children as any[], random)
      if (r) for (i = 0; i < n; ++i) children[i].r! -= r
      node.r = e + r
    }
  }
}

function translateChild<T>(k: number): (node: HierarchyNode<T>) => void {
  return function (node: HierarchyNode<T>): void {
    const parent = node.parent
    node.r = node.r! * k
    if (parent) {
      node.x = parent.x! + k * node.x!
      node.y = parent.y! + k * node.y!
    }
  }
}
