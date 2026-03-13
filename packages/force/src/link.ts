import constant from './constant.ts'
import jiggle from './jiggle.ts'
import type { ForceNode } from './center.ts'

export interface ForceLink {
  index?: number
  source: ForceNode | string | number
  target: ForceNode | string | number
  [key: string]: unknown
}

function index(d: ForceLink): string | number {
  return (d as ForceNode).index!
}

function find(nodeById: Map<string | number, ForceNode>, nodeId: string | number): ForceNode {
  const node = nodeById.get(nodeId)
  // eslint-disable-next-line pickier/no-unused-vars
  if (!node) throw new Error('node not found: ' + nodeId)
  return node
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
export default function forceLink(links?: ForceLink[]): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessor can be customized
  let id: (d: any, i: number, nodes: any[]) => any = index
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let strength: any = defaultStrength
  let strengths: number[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessor may be function or constant
  let distance: any = constant(30)
  let distances: number[]
  let nodes: ForceNode[]
  let count: number[]
  let bias: number[]
  let random: () => number
  let iterations = 1

  if (links == null) links = []

  function defaultStrength(link: ForceLink): number {
    return 1 / Math.min(count[(link.source as ForceNode).index!], count[(link.target as ForceNode).index!])
  }

  function force(alpha: number): void {
    for (let k = 0, n = links!.length; k < iterations; ++k) {
      for (let i = 0, link: ForceLink, source: ForceNode, target: ForceNode, x: number, y: number, l: number, b: number; i < n; ++i) {
        link = links![i]
        source = link.source as ForceNode
        target = link.target as ForceNode
        x = target.x! + target.vx! - source.x! - source.vx! || jiggle(random)
        y = target.y! + target.vy! - source.y! - source.vy! || jiggle(random)
        l = Math.sqrt(x * x + y * y)
        l = (l - distances[i]) / l * alpha * strengths[i]
        x *= l
        y *= l
        target.vx! -= x * (b = bias[i])
        target.vy! -= y * b
        source.vx! += x * (b = 1 - b)
        source.vy! += y * b
      }
    }
  }

  function initialize(): void {
    if (!nodes) return

    let i: number
    const n = nodes.length
    const m = links!.length
    const nodeById = new Map<string | number, ForceNode>(nodes.map((d, i) => [id(d as unknown as ForceLink, i, nodes), d]))
    let link: ForceLink

    for (i = 0, count = new Array(n); i < m; ++i) {
      link = links![i]
      link.index = i
      if (typeof link.source !== 'object') link.source = find(nodeById, link.source)
      if (typeof link.target !== 'object') link.target = find(nodeById, link.target)
      count[(link.source as ForceNode).index!] = (count[(link.source as ForceNode).index!] || 0) + 1
      count[(link.target as ForceNode).index!] = (count[(link.target as ForceNode).index!] || 0) + 1
    }

    for (i = 0, bias = new Array(m); i < m; ++i) {
      link = links![i]
      bias[i] = count[(link.source as ForceNode).index!] / (count[(link.source as ForceNode).index!] + count[(link.target as ForceNode).index!])
    }

    strengths = new Array(m)
    initializeStrength()
    distances = new Array(m)
    initializeDistance()
  }

  function initializeStrength(): void {
    if (!nodes) return

    for (let i = 0, n = links!.length; i < n; ++i) {
      strengths[i] = +strength(links![i], i, links!)
    }
  }

  function initializeDistance(): void {
    if (!nodes) return

    for (let i = 0, n = links!.length; i < n; ++i) {
      distances[i] = +distance(links![i], i, links!)
    }
  }

  force.initialize = function (_nodes: ForceNode[], _random: () => number): void {
    nodes = _nodes
    random = _random
    initialize()
  }

  force.links = function (_?: ForceLink[]): ForceLink[] | typeof force {
    return arguments.length ? (links = _!, initialize(), force) : links!
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
  force.id = function (_?: (d: any, i: number, nodes: any[]) => any): typeof id | typeof force {
    return arguments.length ? (id = _!, force) : id
  }

  force.iterations = function (_?: number): number | typeof force {
    return arguments.length ? (iterations = +_!, force) : iterations
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
  force.strength = function (_?: any): typeof strength | typeof force {
    return arguments.length ? (strength = typeof _ === 'function' ? _ : constant(+_), initializeStrength(), force) : strength
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
  force.distance = function (_?: any): typeof distance | typeof force {
    return arguments.length ? (distance = typeof _ === 'function' ? _ : constant(+_), initializeDistance(), force) : distance
  }

  return force
}
