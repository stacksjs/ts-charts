import constant from './constant.ts'
import type { ForceNode } from './center.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessor can be function or constant
type NodeAccessor = (...args: any[]) => number

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
export default function forceY(_y?: number | NodeAccessor): any {
  let strength: NodeAccessor = constant(0.1)
  let nodes: ForceNode[]
  let strengths: number[]
  let yz: number[]
  let y: NodeAccessor = typeof _y === 'function' ? _y : constant(_y == null ? 0 : +_y)

  function force(alpha: number): void {
    for (let i = 0, n = nodes.length, node: ForceNode; i < n; ++i) {
      node = nodes[i]
      node.vy! += (yz[i] - node.y!) * strengths[i] * alpha
    }
  }

  function initialize(): void {
    if (!nodes) return
    let i: number
    const n = nodes.length
    strengths = new Array(n)
    yz = new Array(n)
    for (i = 0; i < n; ++i) {
      strengths[i] = isNaN(yz[i] = +y(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes)
    }
  }

  force.initialize = function (_: ForceNode[]): void {
    nodes = _
    initialize()
  }

  force.strength = function (_?: number | NodeAccessor): NodeAccessor | typeof force {
    return arguments.length ? (strength = typeof _ === 'function' ? _ : constant(+_!), initialize(), force) : strength
  }

  force.y = function (_?: number | NodeAccessor): typeof y | typeof force {
    return arguments.length ? (y = typeof _ === 'function' ? _ : constant(+_!), initialize(), force) : y
  }

  return force
}
