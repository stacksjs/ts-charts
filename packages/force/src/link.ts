import constant from './constant.ts'
import jiggle from './jiggle.ts'
import type { ForceNode } from './center.ts'

function index(d: any): number {
  return d.index
}

function find(nodeById: Map<any, ForceNode>, nodeId: any): ForceNode {
  const node = nodeById.get(nodeId)
  if (!node) throw new Error('node not found: ' + nodeId)
  return node
}

export default function forceLink(links?: any[]): any {
  let id: (d: any, i: number, nodes: any[]) => any = index
  let strength: any = defaultStrength
  let strengths: number[]
  let distance: any = constant(30)
  let distances: number[]
  let nodes: ForceNode[]
  let count: number[]
  let bias: number[]
  let random: () => number
  let iterations = 1

  if (links == null) links = []

  function defaultStrength(link: any): number {
    return 1 / Math.min(count[link.source.index], count[link.target.index])
  }

  function force(alpha: number): void {
    for (let k = 0, n = links!.length; k < iterations; ++k) {
      for (let i = 0, link: any, source: any, target: any, x: number, y: number, l: number, b: number; i < n; ++i) {
        link = links![i]
        source = link.source
        target = link.target
        x = target.x + target.vx - source.x - source.vx || jiggle(random)
        y = target.y + target.vy - source.y - source.vy || jiggle(random)
        l = Math.sqrt(x * x + y * y)
        l = (l - distances[i]) / l * alpha * strengths[i]
        x *= l
        y *= l
        target.vx -= x * (b = bias[i])
        target.vy -= y * b
        source.vx += x * (b = 1 - b)
        source.vy += y * b
      }
    }
  }

  function initialize(): void {
    if (!nodes) return

    let i: number
    const n = nodes.length
    const m = links!.length
    const nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d]))
    let link: any

    for (i = 0, count = new Array(n); i < m; ++i) {
      link = links![i]
      link.index = i
      if (typeof link.source !== 'object') link.source = find(nodeById, link.source)
      if (typeof link.target !== 'object') link.target = find(nodeById, link.target)
      count[link.source.index] = (count[link.source.index] || 0) + 1
      count[link.target.index] = (count[link.target.index] || 0) + 1
    }

    for (i = 0, bias = new Array(m); i < m; ++i) {
      link = links![i]
      bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index])
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

  force.links = function (_?: any[]): any {
    return arguments.length ? (links = _, initialize(), force) : links
  }

  force.id = function (_?: (d: any, i: number, nodes: any[]) => any): any {
    return arguments.length ? (id = _!, force) : id
  }

  force.iterations = function (_?: number): any {
    return arguments.length ? (iterations = +_!, force) : iterations
  }

  force.strength = function (_?: any): any {
    return arguments.length ? (strength = typeof _ === 'function' ? _ : constant(+_), initializeStrength(), force) : strength
  }

  force.distance = function (_?: any): any {
    return arguments.length ? (distance = typeof _ === 'function' ? _ : constant(+_), initializeDistance(), force) : distance
  }

  return force
}
