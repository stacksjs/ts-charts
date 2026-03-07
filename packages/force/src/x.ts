import constant from './constant.ts'
import type { ForceNode } from './center.ts'

export default function forceX(x?: any): any {
  let strength: any = constant(0.1)
  let nodes: ForceNode[]
  let strengths: number[]
  let xz: number[]

  if (typeof x !== 'function') x = constant(x == null ? 0 : +x)

  function force(alpha: number): void {
    for (let i = 0, n = nodes.length, node: ForceNode; i < n; ++i) {
      node = nodes[i]
      node.vx! += (xz[i] - node.x!) * strengths[i] * alpha
    }
  }

  function initialize(): void {
    if (!nodes) return
    let i: number
    const n = nodes.length
    strengths = new Array(n)
    xz = new Array(n)
    for (i = 0; i < n; ++i) {
      strengths[i] = isNaN(xz[i] = +x(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes)
    }
  }

  force.initialize = function (_: ForceNode[]): void {
    nodes = _
    initialize()
  }

  force.strength = function (_?: any): any {
    return arguments.length ? (strength = typeof _ === 'function' ? _ : constant(+_), initialize(), force) : strength
  }

  force.x = function (_?: any): any {
    return arguments.length ? (x = typeof _ === 'function' ? _ : constant(+_), initialize(), force) : x
  }

  return force
}
