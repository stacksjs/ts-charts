import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from '@ts-charts/force'

/** A node in a network graph. Mutated in place by the force layout. */
export interface GraphNode {
  id: string
  /** Grouping key — drives default node color. */
  group?: string | number
  /** Magnitude — drives default node radius. */
  value?: number
  label?: string
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
  index?: number
}

/** An edge between two nodes, referenced by id or by node object. */
export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  /** Magnitude — drives default link width and strength. */
  value?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface GraphLayoutOptions {
  width?: number
  height?: number
  /** Ticks to run when computing a static layout. */
  iterations?: number
  /** Many-body charge; negative repels. */
  chargeStrength?: number
  linkDistance?: number | ((link: GraphLink) => number)
  collideRadius?: number | ((node: GraphNode) => number)
}

const defaults = {
  width: 800,
  height: 600,
  iterations: 300,
  chargeStrength: -120,
  linkDistance: 60,
  collideRadius: 12,
}

function accessor<T, R>(value: R | ((d: T) => R)): (d: T) => R {
  return typeof value === 'function' ? value as (d: T) => R : () => value
}

/**
 * Build a force simulation for a node-link graph: link, charge, center and
 * collision forces wired up with sensible defaults. The simulation is
 * returned stopped so callers decide between animated (`restart()`) and
 * static (`tick(n)`) use.
 */
export function createGraphSimulation(data: GraphData, options: GraphLayoutOptions = {}): any {
  const { width, height, chargeStrength, linkDistance, collideRadius } = { ...defaults, ...options }

  const link = forceLink(data.links as any[])
    .id((d: GraphNode) => d.id)
    .distance(accessor(linkDistance))

  return forceSimulation(data.nodes as any[])
    .force('link', link)
    .force('charge', forceManyBody().strength(chargeStrength))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide(accessor(collideRadius) as any))
    .stop()
}

/**
 * Compute node positions synchronously. Nodes are mutated in place (x/y set)
 * and the same data object is returned — useful for SSR, tests, or rendering
 * a settled graph without animation.
 */
export function graphLayout(data: GraphData, options: GraphLayoutOptions = {}): GraphData {
  const { iterations } = { ...defaults, ...options }
  createGraphSimulation(data, options).tick(iterations)
  return data
}
