import constant from './constant.ts'
import type { ForceNode } from './center.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessor can be function or constant
// eslint-disable-next-line pickier/no-unused-vars
type NodeAccessor = (...args: any[]) => number

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
export default function forceX(_x?: number | NodeAccessor): any {
  let strength: NodeAccessor = constant(0.1)
  let nodes: ForceNode[]
  let strengths: number[]
  let xz: number[]
  let x: NodeAccessor = typeof _x === 'function' ? _x : constant(_x == null ? 0 : +_x)

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

  force.strength = function (_?: number | NodeAccessor): NodeAccessor | typeof force {
    return arguments.length ? (strength = typeof _ === 'function' ? _ : constant(+_!), initialize(), force) : strength
  }

  force.x = function (_?: number | NodeAccessor): typeof x | typeof force {
    return arguments.length ? (x = typeof _ === 'function' ? _ : constant(+_!), initialize(), force) : x
  }

  return force
}
