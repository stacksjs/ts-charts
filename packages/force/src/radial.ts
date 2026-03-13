import constant from './constant.ts'
import type { ForceNode } from './center.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessor can be function or constant
// eslint-disable-next-line pickier/no-unused-vars
type NodeAccessor = (...args: any[]) => number

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
export default function forceRadial(_radius?: number | NodeAccessor, x?: number | null, y?: number | null): any {
  let nodes: ForceNode[]
  let strength: NodeAccessor = constant(0.1)
  let strengths: number[]
  let radiuses: number[]
  let radius: NodeAccessor = typeof _radius === 'function' ? _radius : constant(+(_radius as number))

  if (x == null) x = 0
  if (y == null) y = 0

  function force(alpha: number): void {
    for (let i = 0, n = nodes.length; i < n; ++i) {
      const node = nodes[i]
      const dx = node.x! - (x as number) || 1e-6
      const dy = node.y! - (y as number) || 1e-6
      const r = Math.sqrt(dx * dx + dy * dy)
      const k = (radiuses[i] - r) * strengths[i] * alpha / r
      node.vx! += dx * k
      node.vy! += dy * k
    }
  }

  function initialize(): void {
    if (!nodes) return
    let i: number
    const n = nodes.length
    strengths = new Array(n)
    radiuses = new Array(n)
    for (i = 0; i < n; ++i) {
      radiuses[i] = +radius(nodes[i], i, nodes)
      strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes)
    }
  }

  force.initialize = function (_: ForceNode[]): void {
    nodes = _
    initialize()
  }

  force.strength = function (_?: number | NodeAccessor): NodeAccessor | typeof force {
    return arguments.length ? (strength = typeof _ === 'function' ? _ : constant(+_!), initialize(), force) : strength
  }

  force.radius = function (_?: number | NodeAccessor): typeof radius | typeof force {
    return arguments.length ? (radius = typeof _ === 'function' ? _ : constant(+_!), initialize(), force) : radius
  }

  force.x = function (_?: number): number | typeof force {
    return arguments.length ? (x = +_!, force) : x as number
  }

  force.y = function (_?: number): number | typeof force {
    return arguments.length ? (y = +_!, force) : y as number
  }

  return force
}
