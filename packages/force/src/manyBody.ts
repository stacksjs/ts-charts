import { quadtree } from '@ts-charts/quadtree'
import constant from './constant.ts'
import jiggle from './jiggle.ts'
import { x, y } from './simulation.ts'
import type { ForceNode } from './center.ts'

interface ManyBodyQuad {
  data: ForceNode
  value: number
  x: number
  y: number
  length?: number
  next?: ManyBodyQuad
  r?: number
  [index: number]: ManyBodyQuad | undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
export default function forceManyBody(): any {
  let nodes: ForceNode[]
  let node: ForceNode
  let random: () => number
  let alpha: number
  let strength: (node: ForceNode, i: number, nodes: ForceNode[]) => number = constant(-30) as unknown as (node: ForceNode, i: number, nodes: ForceNode[]) => number
  let strengths: number[]
  let distanceMin2 = 1
  let distanceMax2 = Infinity
  let theta2 = 0.81

  function force(_: number): void {
    let i: number
    const n = nodes.length
    const tree = quadtree(nodes, x, y).visitAfter(accumulate)
    for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply)
  }

  function initialize(): void {
    if (!nodes) return
    let i: number
    const n = nodes.length
    let nd: ForceNode
    strengths = new Array(n)
    for (i = 0; i < n; ++i) nd = nodes[i], strengths[nd.index!] = +strength(nd, i, nodes)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- quadtree node structure
  function accumulate(quad: any): void {
    let str = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any
    let c: number
    let weight = 0
    let x: number
    let y: number
    let i: number

    // For internal nodes, accumulate forces from child quadrants.
    if (quad.length) {
      for (x = y = i = 0; i < 4; ++i) {
        if ((q = quad[i]) && (c = Math.abs(q.value))) {
          str += q.value
          weight += c
          x += c * q.x
          y += c * q.y
        }
      }
      quad.x = x / weight
      quad.y = y / weight
    }

    // For leaf nodes, accumulate forces from coincident quadrants.
    else {
      q = quad
      q.x = q.data.x
      q.y = q.data.y
      do str += strengths[q.data.index]
      while (q = q.next)
    }

    quad.value = str
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- quadtree node structure
  function apply(quad: any, x1: number, _: number, x2: number): boolean | void {
    if (!quad.value) return true

    let x = quad.x - node.x!
    let y = quad.y - node.y!
    let w = x2 - x1
    let l = x * x + y * y

    // Apply the Barnes-Hut approximation if possible.
    // Limit forces for very close nodes; randomize direction if coincident.
    if (w * w / theta2 < l) {
      if (l < distanceMax2) {
        if (x === 0) x = jiggle(random), l += x * x
        if (y === 0) y = jiggle(random), l += y * y
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l)
        node.vx! += x * quad.value * alpha / l
        node.vy! += y * quad.value * alpha / l
      }
      return true
    }

    // Otherwise, process points directly.
    else if (quad.length || l >= distanceMax2) return

    // Limit forces for very close nodes; randomize direction if coincident.
    if (quad.data !== node || quad.next) {
      if (x === 0) x = jiggle(random), l += x * x
      if (y === 0) y = jiggle(random), l += y * y
      if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l)
    }

    do if (quad.data !== node) {
      w = strengths[quad.data.index] * alpha / l
      node.vx! += x * w
      node.vy! += y * w
    } while (quad = quad.next)
  }

  force.initialize = function (_nodes: ForceNode[], _random: () => number): void {
    nodes = _nodes
    random = _random
    initialize()
  }

  force.strength = function (_?: number | ((node: ForceNode, i: number, nodes: ForceNode[]) => number)): typeof strength | typeof force {
    return arguments.length ? (strength = typeof _ === 'function' ? _ : constant(+_!) as unknown as (node: ForceNode, i: number, nodes: ForceNode[]) => number, initialize(), force) : strength
  }

  force.distanceMin = function (_?: number): number | typeof force {
    return arguments.length ? (distanceMin2 = _! * _!, force) : Math.sqrt(distanceMin2)
  }

  force.distanceMax = function (_?: number): number | typeof force {
    return arguments.length ? (distanceMax2 = _! * _!, force) : Math.sqrt(distanceMax2)
  }

  force.theta = function (_?: number): number | typeof force {
    return arguments.length ? (theta2 = _! * _!, force) : Math.sqrt(theta2)
  }

  return force
}
