import { quadtree } from '@ts-charts/quadtree'
import constant from './constant.ts'
import jiggle from './jiggle.ts'
import type { ForceNode } from './center.ts'

function x(d: ForceNode): number {
  return d.x! + d.vx!
}

function y(d: ForceNode): number {
  return d.y! + d.vy!
}

export default function forceCollide(radius?: number | ((node: ForceNode, i: number, nodes: ForceNode[]) => number)): any {
  let nodes: ForceNode[]
  let radii: number[]
  let random: () => number
  let strength = 1
  let iterations = 1

  if (typeof radius !== 'function') radius = constant(radius == null ? 1 : +radius)

  function force(): void {
    let i: number
    const n = nodes.length
    let tree: any
    let node: ForceNode
    let xi: number
    let yi: number
    let ri: number
    let ri2: number

    for (let k = 0; k < iterations; ++k) {
      tree = quadtree(nodes, x, y).visitAfter(prepare)
      for (i = 0; i < n; ++i) {
        node = nodes[i]
        ri = radii[node.index!]
        ri2 = ri * ri
        xi = node.x! + node.vx!
        yi = node.y! + node.vy!
        tree.visit(apply)
      }
    }

    function apply(quad: any, x0: number, y0: number, x1: number, y1: number): boolean | void {
      const data = quad.data
      let rj = quad.r
      let r = ri + rj
      if (data) {
        if (data.index > node.index!) {
          let x = xi - data.x - data.vx
          let y = yi - data.y - data.vy
          let l = x * x + y * y
          if (l < r * r) {
            if (x === 0) x = jiggle(random), l += x * x
            if (y === 0) y = jiggle(random), l += y * y
            l = (r - (l = Math.sqrt(l))) / l * strength
            node.vx! += (x *= l) * (r = (rj *= rj) / (ri2 + rj))
            node.vy! += (y *= l) * r
            data.vx -= x * (r = 1 - r)
            data.vy -= y * r
          }
        }
        return
      }
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r
    }
  }

  function prepare(quad: any): void {
    if (quad.data) { quad.r = radii[quad.data.index]; return }
    for (let i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r
      }
    }
  }

  function initialize(): void {
    if (!nodes) return
    let i: number
    const n = nodes.length
    let node: ForceNode
    radii = new Array(n)
    for (i = 0; i < n; ++i) node = nodes[i], radii[node.index!] = +(radius as Function)(node, i, nodes)
  }

  force.initialize = function (_nodes: ForceNode[], _random: () => number): void {
    nodes = _nodes
    random = _random
    initialize()
  }

  force.iterations = function (_?: number): any {
    return arguments.length ? (iterations = +_!, force) : iterations
  }

  force.strength = function (_?: number): any {
    return arguments.length ? (strength = +_!, force) : strength
  }

  force.radius = function (_?: number | ((node: ForceNode, i: number, nodes: ForceNode[]) => number)): any {
    return arguments.length ? (radius = typeof _ === 'function' ? _ : constant(+(_ as number)), initialize(), force) : radius
  }

  return force
}
