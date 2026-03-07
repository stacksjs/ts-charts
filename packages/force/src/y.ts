import constant from './constant.ts'
import type { ForceNode } from './center.ts'

export default function forceY(y?: any): any {
  let strength: any = constant(0.1)
  let nodes: ForceNode[]
  let strengths: number[]
  let yz: number[]

  if (typeof y !== 'function') y = constant(y == null ? 0 : +y)

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

  force.strength = function (_?: any): any {
    return arguments.length ? (strength = typeof _ === 'function' ? _ : constant(+_), initialize(), force) : strength
  }

  force.y = function (_?: any): any {
    return arguments.length ? (y = typeof _ === 'function' ? _ : constant(+_), initialize(), force) : y
  }

  return force
}
