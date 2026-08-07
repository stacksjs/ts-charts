/**
 * Layered (Sugiyama) graph drawing: rank → order → position → route.
 *
 * Where {@link graphLayout} settles a graph physically, this lays one out
 * *structurally* — every edge points the same way, nodes sit on discrete
 * layers, and long edges bend through routing points instead of cutting
 * across the drawing. That is what pipelines, dependency trees and
 * architecture diagrams want, and a force simulation cannot give it.
 *
 * Pure geometry: no DOM, no timers, no other ts-charts packages. Safe to run
 * server-side (SSR, tests) and cheap enough to re-run on every data refresh.
 */

/** A node to be placed. Everything but `id` is optional. */
export interface LayeredNode {
  id: string
  /** Pin the node to a layer instead of deriving one from the edges. */
  layer?: number
  /** Box size used for spacing and anchor points; falls back to the options. */
  width?: number
  height?: number
}

/** A directed edge between two node ids. */
export interface LayeredEdge {
  source: string
  target: string
  /** Relative pull during ordering and straightening. Default 1. */
  weight?: number
}

export interface LayeredGraph {
  nodes: LayeredNode[]
  edges: LayeredEdge[]
}

/** Which way the layers advance. `down` is the usual top-to-bottom diagram. */
export type LayeredDirection = 'down' | 'up' | 'right' | 'left'

export interface LayeredLayoutOptions {
  direction?: LayeredDirection
  /** Default node box size for nodes that don't carry their own. */
  nodeWidth?: number
  nodeHeight?: number
  /** Gap between consecutive layers (along the layer axis). */
  layerGap?: number
  /** Minimum gap between neighbours within a layer. */
  nodeGap?: number
  /** Padding added around the whole drawing. */
  padding?: number
  /** Ordering sweeps. More sweeps ⇒ fewer crossings, linearly more work. */
  iterations?: number
  /** Straightening passes applied after ordering. */
  straightenPasses?: number
}

export interface LayeredLayoutNode {
  id: string
  layer: number
  /** Position within the layer, 0-based, in cross-axis order. */
  order: number
  /** Top-left corner of the node box. */
  x: number
  y: number
  width: number
  height: number
}

export interface LayeredLayoutEdge {
  source: string
  target: string
  /** Anchor → bend points → anchor, already in drawing coordinates. */
  points: Array<{ x: number, y: number }>
  /** The edge ran against the layering and was flipped to break a cycle. */
  reversed: boolean
  /** The edge connects nodes on the same layer, so it is routed sideways. */
  flat: boolean
}

export interface LayeredLayoutLayer {
  index: number
  /** Ids in cross-axis order. */
  nodes: string[]
  /** Bounding band of the layer, useful for backdrops and lane labels. */
  x: number
  y: number
  width: number
  height: number
}

export interface LayeredLayoutResult {
  nodes: LayeredLayoutNode[]
  edges: LayeredLayoutEdge[]
  layers: LayeredLayoutLayer[]
  width: number
  height: number
  /** Crossings left after ordering — a layout-quality signal for callers. */
  crossings: number
}

const defaults = {
  direction: 'down' as LayeredDirection,
  nodeWidth: 160,
  nodeHeight: 56,
  layerGap: 80,
  nodeGap: 28,
  padding: 24,
  iterations: 8,
  straightenPasses: 6,
}

/** Internal placement record; dummies stand in for a long edge's waypoints. */
interface Cell {
  id: string
  layer: number
  order: number
  /** Extent along the layer axis (height when going down). */
  depth: number
  /** Extent across the layer (width when going down). */
  breadth: number
  /** Center position across the layer. */
  pos: number
  dummy: boolean
}

interface Span {
  source: string
  target: string
  weight: number
  reversed: boolean
  /** Dummy cell ids between the endpoints, source-first. */
  bends: string[]
}

/**
 * Break cycles by reversing the back edges found in a depth-first walk. The
 * returned edges form a DAG; reversed ones remember their original direction
 * so the drawing can still point the arrow the way the caller meant.
 */
function breakCycles(
  ids: string[],
  edges: LayeredEdge[],
): Array<{ source: string, target: string, weight: number, reversed: boolean }> {
  const out: Array<{ source: string, target: string, weight: number, reversed: boolean }> = []
  const outgoing = new Map<string, LayeredEdge[]>()
  for (const id of ids) outgoing.set(id, [])
  for (const edge of edges) outgoing.get(edge.source)?.push(edge)

  const visited = new Set<string>()
  const stack = new Set<string>()
  const reversed = new Set<LayeredEdge>()

  const visit = (id: string): void => {
    visited.add(id)
    stack.add(id)
    for (const edge of outgoing.get(id) ?? []) {
      if (stack.has(edge.target)) reversed.add(edge)
      else if (!visited.has(edge.target)) visit(edge.target)
    }
    stack.delete(id)
  }
  for (const id of ids) if (!visited.has(id)) visit(id)

  for (const edge of edges) {
    const weight = edge.weight ?? 1
    if (reversed.has(edge)) out.push({ source: edge.target, target: edge.source, weight, reversed: true })
    else out.push({ source: edge.source, target: edge.target, weight, reversed: false })
  }
  return out
}

/**
 * Longest-path ranking, then explicit layers win. Explicit layers can pull a
 * node above its own predecessors; the offending edges are simply drawn
 * backwards rather than silently re-ranked, because a pinned layer is the
 * caller stating intent.
 */
function assignLayers(
  nodes: LayeredNode[],
  edges: Array<{ source: string, target: string }>,
): Map<string, number> {
  const rank = new Map<string, number>()
  const incoming = new Map<string, string[]>()
  const outgoing = new Map<string, string[]>()
  const indegree = new Map<string, number>()
  for (const node of nodes) {
    incoming.set(node.id, [])
    outgoing.set(node.id, [])
    indegree.set(node.id, 0)
  }
  for (const edge of edges) {
    if (edge.source === edge.target) continue
    incoming.get(edge.target)?.push(edge.source)
    outgoing.get(edge.source)?.push(edge.target)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  }

  // Kahn's algorithm, taking each node one layer below its deepest predecessor.
  const queue: string[] = []
  for (const node of nodes) {
    if ((indegree.get(node.id) ?? 0) === 0) {
      rank.set(node.id, 0)
      queue.push(node.id)
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const id = queue[head]
    for (const next of outgoing.get(id) ?? []) {
      rank.set(next, Math.max(rank.get(next) ?? 0, (rank.get(id) ?? 0) + 1))
      const left = (indegree.get(next) ?? 0) - 1
      indegree.set(next, left)
      if (left === 0) queue.push(next)
    }
  }
  // Anything left is in a component the walk could not drain; rank it at 0.
  for (const node of nodes) if (!rank.has(node.id)) rank.set(node.id, 0)

  for (const node of nodes) if (node.layer != null && Number.isFinite(node.layer)) rank.set(node.id, node.layer)

  const min = Math.min(...rank.values())
  if (min !== 0) for (const [id, value] of rank) rank.set(id, value - min)
  return rank
}

/** Count crossings between two adjacent layers by brute-force pair comparison. */
function countCrossings(order: string[][], pairs: Map<string, string[]>): number {
  let crossings = 0
  for (let layer = 0; layer + 1 < order.length; layer++) {
    const index = new Map<string, number>()
    order[layer + 1].forEach((id, at) => index.set(id, at))
    const positions: number[] = []
    for (const id of order[layer]) {
      for (const next of pairs.get(id) ?? []) {
        const at = index.get(next)
        if (at != null) positions.push(at)
      }
    }
    for (let a = 0; a < positions.length; a++)
      for (let b = a + 1; b < positions.length; b++) if (positions[a] > positions[b]) crossings++
  }
  return crossings
}

/** Median of a node's neighbour positions; -1 when it has none (stay put). */
function median(values: number[]): number {
  if (!values.length) return -1
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  if (sorted.length % 2 === 1) return sorted[mid]
  // Weighted median (Gansner et al.): bias toward the denser side.
  if (sorted.length === 2) return (sorted[0] + sorted[1]) / 2
  const left = sorted[mid - 1] - sorted[0]
  const right = sorted[sorted.length - 1] - sorted[mid]
  return (sorted[mid - 1] * right + sorted[mid] * left) / (left + right || 1)
}

/**
 * Lay out a directed graph in layers.
 *
 * Cycles are broken, nodes are ranked, long edges get routing bends, layer
 * orders are swept to cut crossings, and positions are straightened along the
 * edges before everything is mapped into drawing coordinates.
 */
export function layeredLayout(graph: LayeredGraph, options: LayeredLayoutOptions = {}): LayeredLayoutResult {
  const opts = { ...defaults, ...options }
  const horizontal = opts.direction === 'right' || opts.direction === 'left'

  const known = new Map<string, LayeredNode>()
  for (const node of graph.nodes) known.set(node.id, node)
  const ids = [...known.keys()]
  const usable = graph.edges.filter((edge) => known.has(edge.source) && known.has(edge.target))

  if (!ids.length) {
    return { nodes: [], edges: [], layers: [], width: opts.padding * 2, height: opts.padding * 2, crossings: 0 }
  }

  const acyclic = breakCycles(ids, usable)
  const rank = assignLayers(graph.nodes, acyclic)

  // Node extents, resolved once — dummies borrow the cross-axis gap only.
  const cells = new Map<string, Cell>()
  const depthOf = (node: LayeredNode): number =>
    horizontal ? (node.width ?? opts.nodeWidth) : (node.height ?? opts.nodeHeight)
  const breadthOf = (node: LayeredNode): number =>
    horizontal ? (node.height ?? opts.nodeHeight) : (node.width ?? opts.nodeWidth)

  for (const node of graph.nodes) {
    cells.set(node.id, {
      id: node.id,
      layer: rank.get(node.id) ?? 0,
      order: 0,
      depth: depthOf(node),
      breadth: breadthOf(node),
      pos: 0,
      dummy: false,
    })
  }

  // Split every multi-layer edge into unit-length segments through dummies, so
  // ordering and straightening see a proper layer-by-layer chain.
  const spans: Span[] = []
  const segments: Array<{ from: string, to: string, weight: number }> = []
  // Prefixed so a dummy can never collide with a caller's id, however odd.
  let bendPrefix = '__bend'
  while (ids.some((id) => id.startsWith(bendPrefix))) bendPrefix = `_${bendPrefix}`
  let dummySeq = 0
  for (const edge of acyclic) {
    if (edge.source === edge.target) continue
    const from = cells.get(edge.source)!
    const to = cells.get(edge.target)!
    const span: Span = {
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      reversed: edge.reversed,
      bends: [],
    }
    spans.push(span)
    if (to.layer <= from.layer) {
      // Flat or backwards after explicit pinning: route it directly.
      segments.push({ from: edge.source, to: edge.target, weight: edge.weight })
      continue
    }
    let previous = edge.source
    for (let layer = from.layer + 1; layer < to.layer; layer++) {
      const id = `${bendPrefix}${dummySeq++}`
      cells.set(id, { id, layer, order: 0, depth: 0, breadth: 0, pos: 0, dummy: true })
      span.bends.push(id)
      segments.push({ from: previous, to: id, weight: edge.weight })
      previous = id
    }
    segments.push({ from: previous, to: edge.target, weight: edge.weight })
  }

  // ── Ordering ───────────────────────────────────────────────────────────────
  const layerCount = Math.max(...[...cells.values()].map((cell) => cell.layer)) + 1
  let order: string[][] = Array.from({ length: layerCount }, () => [])
  for (const cell of cells.values()) order[cell.layer].push(cell.id)

  const down = new Map<string, string[]>()
  const up = new Map<string, string[]>()
  for (const id of cells.keys()) {
    down.set(id, [])
    up.set(id, [])
  }
  for (const segment of segments) {
    const from = cells.get(segment.from)!
    const to = cells.get(segment.to)!
    if (to.layer === from.layer + 1) {
      down.get(segment.from)!.push(segment.to)
      up.get(segment.to)!.push(segment.from)
    }
  }

  const indexOf = (layer: string[]): Map<string, number> => {
    const map = new Map<string, number>()
    layer.forEach((id, at) => map.set(id, at))
    return map
  }

  const sweep = (current: string[][], forward: boolean): string[][] => {
    const next = current.map((layer) => [...layer])
    const range = forward
      ? [...next.keys()].slice(1)
      : [...next.keys()].slice(0, -1).reverse()
    for (const layer of range) {
      const reference = indexOf(next[forward ? layer - 1 : layer + 1])
      const neighbours = forward ? up : down
      const keys = new Map<string, number>()
      next[layer].forEach((id, at) => {
        const positions = (neighbours.get(id) ?? [])
          .map((other) => reference.get(other))
          .filter((value): value is number => value != null)
        const value = median(positions)
        keys.set(id, value < 0 ? at : value)
      })
      next[layer].sort((a, b) => (keys.get(a) ?? 0) - (keys.get(b) ?? 0))
    }
    return next
  }

  /** Swap adjacent pairs while it strictly reduces crossings. */
  const transpose = (current: string[][]): string[][] => {
    const next = current.map((layer) => [...layer])
    let improved = true
    let guard = 0
    while (improved && guard++ < 8) {
      improved = false
      for (let layer = 0; layer < next.length; layer++) {
        for (let at = 0; at + 1 < next[layer].length; at++) {
          const before = countCrossings(next, down)
          const row = next[layer]
          const swap = (): void => {
            const held = row[at]
            row[at] = row[at + 1]
            row[at + 1] = held
          }
          swap()
          if (countCrossings(next, down) < before) improved = true
          else swap()
        }
      }
    }
    return next
  }

  // The sweeps run even when the seed order already has zero crossings: the
  // seed is insertion order, which puts every dummy after every real node, and
  // a later order with the SAME crossing count still reads better because the
  // medians interleave long edges with the nodes they pass. Hence `<=`, and no
  // early exit on a zero count.
  let best = order.map((layer) => [...layer])
  let bestCrossings = countCrossings(best, down)
  for (let iteration = 0; iteration < opts.iterations; iteration++) {
    order = transpose(sweep(order, iteration % 2 === 0))
    const crossings = countCrossings(order, down)
    if (crossings <= bestCrossings) {
      bestCrossings = crossings
      best = order.map((layer) => [...layer])
    }
  }
  order = best
  order.forEach((layer, index) => {
    layer.forEach((id, at) => {
      const cell = cells.get(id)!
      cell.layer = index
      cell.order = at
    })
  })

  // ── Cross-axis positions ───────────────────────────────────────────────────
  // Seed by packing each layer, then pull nodes toward the median of their
  // neighbours while keeping the packing constraint in both directions.
  const pack = (layer: string[]): void => {
    let cursor = 0
    for (const id of layer) {
      const cell = cells.get(id)!
      cell.pos = cursor + cell.breadth / 2
      cursor += cell.breadth + opts.nodeGap
    }
  }
  for (const layer of order) pack(layer)

  const separate = (layer: string[]): void => {
    for (let at = 1; at < layer.length; at++) {
      const previous = cells.get(layer[at - 1])!
      const cell = cells.get(layer[at])!
      const min = previous.pos + previous.breadth / 2 + opts.nodeGap + cell.breadth / 2
      if (cell.pos < min) cell.pos = min
    }
    for (let at = layer.length - 2; at >= 0; at--) {
      const next = cells.get(layer[at + 1])!
      const cell = cells.get(layer[at])!
      const max = next.pos - next.breadth / 2 - opts.nodeGap - cell.breadth / 2
      if (cell.pos > max) cell.pos = max
    }
  }

  for (let pass = 0; pass < opts.straightenPasses; pass++) {
    const forward = pass % 2 === 0
    const range = forward ? [...order.keys()] : [...order.keys()].reverse()
    for (const layer of range) {
      const neighbours = forward ? up : down
      for (const id of order[layer]) {
        const cell = cells.get(id)!
        const positions = (neighbours.get(id) ?? []).map((other) => cells.get(other)!.pos)
        // Dummies track their chain exactly, so long edges come out straight;
        // real nodes take the median so one busy neighbour can't drag them off.
        if (positions.length) cell.pos = cell.dummy ? average(positions) : median(positions)
      }
      separate(order[layer])
    }
  }

  // Center every layer on the widest one so the drawing reads as a column.
  const extentOf = (layer: string[]): { min: number, max: number } => {
    let min = Infinity
    let max = -Infinity
    for (const id of layer) {
      const cell = cells.get(id)!
      min = Math.min(min, cell.pos - cell.breadth / 2)
      max = Math.max(max, cell.pos + cell.breadth / 2)
    }
    return layer.length ? { min, max } : { min: 0, max: 0 }
  }
  const extents = order.map(extentOf)
  const breadth = Math.max(0, ...extents.map((extent) => extent.max - extent.min))
  order.forEach((layer, index) => {
    const shift = (breadth - (extents[index].max - extents[index].min)) / 2 - extents[index].min
    for (const id of layer) cells.get(id)!.pos += shift
  })

  // ── Layer-axis positions ───────────────────────────────────────────────────
  const layerDepth = order.map((layer) => Math.max(0, ...layer.map((id) => cells.get(id)!.depth)))
  const layerStart: number[] = []
  let cursor = opts.padding
  for (let index = 0; index < order.length; index++) {
    layerStart.push(cursor)
    cursor += layerDepth[index] + opts.layerGap
  }
  const totalDepth = cursor - opts.layerGap + opts.padding
  const totalBreadth = breadth + opts.padding * 2

  const reverseLayers = opts.direction === 'up' || opts.direction === 'left'
  const depthAt = (index: number, depth: number): number => {
    const start = layerStart[index] + (layerDepth[index] - depth) / 2
    return reverseLayers ? totalDepth - start - depth : start
  }

  const box = (cell: Cell): { x: number, y: number, width: number, height: number } => {
    const along = depthAt(cell.layer, cell.depth)
    const across = cell.pos + opts.padding - cell.breadth / 2
    return horizontal
      ? { x: along, y: across, width: cell.depth, height: cell.breadth }
      : { x: across, y: along, width: cell.breadth, height: cell.depth }
  }

  const laidOut: LayeredLayoutNode[] = []
  for (const node of graph.nodes) {
    const cell = cells.get(node.id)!
    const rect = box(cell)
    laidOut.push({ id: node.id, layer: cell.layer, order: cell.order, ...rect })
  }

  // ── Edge routing ───────────────────────────────────────────────────────────
  const centerOf = (cell: Cell): { x: number, y: number } => {
    const rect = box(cell)
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  }
  /** Exit/enter point on the box border facing the next layer. */
  const anchorOf = (cell: Cell, leaving: boolean): { x: number, y: number } => {
    const rect = box(cell)
    const forward = leaving !== reverseLayers
    if (horizontal) return { x: forward ? rect.x + rect.width : rect.x, y: rect.y + rect.height / 2 }
    return { x: rect.x + rect.width / 2, y: forward ? rect.y + rect.height : rect.y }
  }
  /** Border point facing sideways, for edges that stay inside one layer. */
  const sideAnchorOf = (cell: Cell, towards: Cell): { x: number, y: number } => {
    const rect = box(cell)
    const after = towards.pos >= cell.pos
    if (horizontal) return { x: rect.x + rect.width / 2, y: after ? rect.y + rect.height : rect.y }
    return { x: after ? rect.x + rect.width : rect.x, y: rect.y + rect.height / 2 }
  }

  const routed: LayeredLayoutEdge[] = spans.map((span) => {
    const from = cells.get(span.source)!
    const to = cells.get(span.target)!
    const flat = to.layer === from.layer
    const backwards = to.layer < from.layer
    const points = flat
      ? [sideAnchorOf(from, to), sideAnchorOf(to, from)]
      : backwards
        ? [anchorOf(from, false), anchorOf(to, true)]
        : [anchorOf(from, true), ...span.bends.map((id) => centerOf(cells.get(id)!)), anchorOf(to, false)]
    // `reversed` edges were flipped to break a cycle; report the caller's own
    // direction so arrowheads and hit-testing still line up with their data.
    return span.reversed
      ? { source: span.target, target: span.source, points: [...points].reverse(), reversed: true, flat }
      : { source: span.source, target: span.target, points, reversed: false, flat }
  })

  const layers: LayeredLayoutLayer[] = order.map((layer, index) => {
    const boxes = layer.filter((id) => !cells.get(id)!.dummy).map((id) => box(cells.get(id)!))
    const along = depthAt(index, layerDepth[index])
    if (!boxes.length) {
      return horizontal
        ? { index, nodes: [], x: along, y: opts.padding, width: layerDepth[index], height: 0 }
        : { index, nodes: [], x: opts.padding, y: along, width: 0, height: layerDepth[index] }
    }
    const minX = Math.min(...boxes.map((rect) => rect.x))
    const minY = Math.min(...boxes.map((rect) => rect.y))
    const maxX = Math.max(...boxes.map((rect) => rect.x + rect.width))
    const maxY = Math.max(...boxes.map((rect) => rect.y + rect.height))
    return {
      index,
      nodes: layer.filter((id) => !cells.get(id)!.dummy),
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  })

  return {
    nodes: laidOut,
    edges: routed,
    layers,
    width: horizontal ? totalDepth : totalBreadth,
    height: horizontal ? totalBreadth : totalDepth,
    crossings: bestCrossings,
  }
}

function average(values: number[]): number {
  let total = 0
  for (const value of values) total += value
  return total / values.length
}

export interface EdgePathOptions {
  /**
   * `smooth` bends with cubic curves along the layer axis (the default and the
   * one that reads best for architecture diagrams), `orthogonal` uses rounded
   * right angles, `linear` joins the points directly.
   */
  curve?: 'smooth' | 'orthogonal' | 'linear'
  direction?: LayeredDirection
  /** Corner radius for `orthogonal`. */
  radius?: number
}

/**
 * Serialize a routed edge's points to an SVG path. Kept separate from the
 * layout so callers can restyle edges without recomputing geometry.
 */
export function edgePath(points: Array<{ x: number, y: number }>, options: EdgePathOptions = {}): string {
  if (points.length < 2) return ''
  const { curve = 'smooth', direction = 'down', radius = 10 } = options
  const horizontal = direction === 'right' || direction === 'left'

  if (curve === 'linear') return `M${round(points[0].x)},${round(points[0].y)}${points.slice(1).map((point) => `L${round(point.x)},${round(point.y)}`).join('')}`

  if (curve === 'orthogonal') {
    let path = `M${round(points[0].x)},${round(points[0].y)}`
    for (let at = 1; at < points.length; at++) {
      const from = points[at - 1]
      const to = points[at]
      const mid = horizontal ? (from.x + to.x) / 2 : (from.y + to.y) / 2
      const corner = Math.min(radius, Math.abs(horizontal ? to.y - from.y : to.x - from.x) / 2)
      if (corner < 0.5) {
        path += `L${round(to.x)},${round(to.y)}`
        continue
      }
      if (horizontal) {
        const sign = to.y > from.y ? 1 : -1
        path += `L${round(mid - corner)},${round(from.y)}Q${round(mid)},${round(from.y)} ${round(mid)},${round(from.y + corner * sign)}`
        path += `L${round(mid)},${round(to.y - corner * sign)}Q${round(mid)},${round(to.y)} ${round(mid + corner)},${round(to.y)}`
        path += `L${round(to.x)},${round(to.y)}`
      }
      else {
        const sign = to.x > from.x ? 1 : -1
        path += `L${round(from.x)},${round(mid - corner)}Q${round(from.x)},${round(mid)} ${round(from.x + corner * sign)},${round(mid)}`
        path += `L${round(to.x - corner * sign)},${round(mid)}Q${round(to.x)},${round(mid)} ${round(to.x)},${round(mid + corner)}`
        path += `L${round(to.x)},${round(to.y)}`
      }
    }
    return path
  }

  let path = `M${round(points[0].x)},${round(points[0].y)}`
  for (let at = 1; at < points.length; at++) {
    const from = points[at - 1]
    const to = points[at]
    if (horizontal) {
      const mid = (from.x + to.x) / 2
      path += `C${round(mid)},${round(from.y)} ${round(mid)},${round(to.y)} ${round(to.x)},${round(to.y)}`
    }
    else {
      const mid = (from.y + to.y) / 2
      path += `C${round(from.x)},${round(mid)} ${round(to.x)},${round(mid)} ${round(to.x)},${round(to.y)}`
    }
  }
  return path
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
