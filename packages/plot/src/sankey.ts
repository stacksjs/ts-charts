import type { ChartLabels } from './chronology.ts'
import { boundedNumber, chartPrefix, chronologyColor, chronologySvg, safeColor } from './chronology.ts'
import { escapeHtml, svgTextLines } from './diagram-svg.ts'

export type SankeyAlignment = 'left' | 'right' | 'center' | 'justify'
export interface SankeyNode { id: string, label?: string, color?: string }
export interface SankeyLink { source: string, target: string, value: number, color?: string }
export interface SankeyChartOptions extends ChartLabels {
  nodes?: readonly SankeyNode[]
  links: readonly SankeyLink[]
  width?: number
  height?: number
  nodeAlignment?: SankeyAlignment
  nodeWidth?: number
  nodePadding?: number
  nodeColors?: Readonly<Record<string, string>>
  linkColor?: string
  linkOpacity?: number
  labelStyle?: 'legacy' | 'outlined'
  labelColor?: string
  backgroundColor?: string
  useMaxWidth?: boolean
  showValues?: boolean
  prefix?: string
  suffix?: string
}

export interface PlacedSankeyNode {
  id: string
  label: string
  color: string
  layer: number
  value: number
  x: number
  y: number
  height: number
}
export interface PlacedSankeyLink {
  source: PlacedSankeyNode
  target: PlacedSankeyNode
  value: number
  color?: string
  width: number
  sourceY: number
  targetY: number
}
export interface SankeyLayout {
  width: number
  height: number
  nodeWidth: number
  nodes: readonly PlacedSankeyNode[]
  links: readonly PlacedSankeyLink[]
}

interface FlowNode extends PlacedSankeyNode {
  index: number
  depth: number
  remaining: number
  incoming: FlowEdge[]
  outgoing: FlowEdge[]
}
interface FlowEdge extends PlacedSankeyLink { source: FlowNode, target: FlowNode, index: number }

const center = (node: PlacedSankeyNode): number => node.y + node.height / 2

function graph(chart: SankeyChartOptions): { nodes: FlowNode[], edges: FlowEdge[] } | undefined {
  if (!Array.isArray(chart.links) || !chart.links.length || chart.links.length > 600
    || (chart.nodes !== undefined && !Array.isArray(chart.nodes))) return
  const byId = new Map<string, FlowNode>()
  const getNode = ({ id, color, label }: SankeyNode): FlowNode => {
    const existing = byId.get(id)
    if (existing) return existing
    const override = chart.nodeColors && Object.hasOwn(chart.nodeColors, id) ? chart.nodeColors[id] : undefined
    const node: FlowNode = {
      id, color: paint(color) ?? paint(override) ?? chronologyColor(byId.size),
      label: typeof label === 'string' && label.trim() ? label : id,
      index: byId.size, depth: 0, remaining: 0, value: 0, layer: 0,
      x: 0, y: 0, height: 0, incoming: [], outgoing: [],
    }
    byId.set(id, node)
    return node
  }
  for (const item of chart.nodes ?? []) {
    if (!item || typeof item.id !== 'string' || !item.id.trim() || byId.has(item.id)) return
    getNode(item)
  }
  const edges: FlowEdge[] = []
  for (const link of chart.links) {
    if (!link || typeof link.source !== 'string' || !link.source.trim() || typeof link.target !== 'string'
      || !link.target.trim() || link.source === link.target || !Number.isFinite(link.value) || link.value < 0) return
    const source = getNode({ id: link.source })
    const target = getNode({ id: link.target })
    const edge = { source, target, value: link.value, color: paint(link.color), index: edges.length, width: 0, sourceY: 0, targetY: 0 }
    source.outgoing.push(edge)
    target.incoming.push(edge)
    edges.push(edge)
  }
  const nodes = [...byId.values()]
  if (nodes.length > 250) return
  return { nodes, edges }
}

function layersFor(nodes: FlowNode[], alignment: SankeyAlignment): FlowNode[][] | undefined {
  const indegree = nodes.map(node => node.incoming.length)
  const ordered = nodes.filter(node => !node.incoming.length)
  for (const node of ordered) {
    for (const { target } of node.outgoing) {
      target.depth = Math.max(target.depth, node.depth + 1)
      if (--indegree[target.index] === 0) ordered.push(target)
    }
  }
  if (ordered.length !== nodes.length) return
  const last = Math.max(...nodes.map(node => node.depth))
  for (const node of ordered.slice().reverse()) {
    for (const { target } of node.outgoing) node.remaining = Math.max(node.remaining, target.remaining + 1)
  }
  const layers: FlowNode[][] = Array.from({ length: last + 1 }, () => [])
  for (const node of nodes) {
    if (alignment === 'right') node.layer = last - node.remaining
    else if (alignment === 'justify') node.layer = node.outgoing.length ? node.depth : last
    else if (alignment === 'center' && !node.incoming.length && node.outgoing.length)
      node.layer = Math.min(...node.outgoing.map(edge => edge.target.depth)) - 1
    else node.layer = node.depth
    layers[node.layer].push(node)
  }
  return layers
}

function pack(layer: FlowNode[], top: number, height: number, padding: number): void {
  const used = layer.reduce((sum, node) => sum + node.height, 0) + Math.max(0, layer.length - 1) * padding
  let y = top + (height - used) / 2
  for (const node of layer) {
    node.y = y
    y += node.height + padding
  }
}

function alignLinks(layers: FlowNode[][], top: number, height: number, padding: number): void {
  for (const layer of layers) pack(layer, top, height, padding)
  for (let iteration = 0; iteration < 6; iteration++) {
    const incoming = iteration % 2 === 0
    for (const layer of incoming ? layers : layers.slice().reverse()) {
      const ranks = layer.map((node) => {
        let weight = 0
        let sum = 0
        for (const edge of incoming ? node.incoming : node.outgoing) {
          const neighbor = incoming ? edge.source : edge.target
          weight += edge.width
          sum += center(neighbor) * edge.width
        }
        return { node, score: weight ? sum / weight : center(node) }
      })
      ranks.sort((a, b) => a.score - b.score || a.node.index - b.node.index)
      pack(ranks.map(rank => rank.node), top, height, padding)
    }
  }
}

function positionPorts(node: FlowNode, edges: FlowEdge[], outgoing: boolean): void {
  const neighbor = (edge: FlowEdge) => outgoing ? edge.target : edge.source
  edges.sort((a, b) => center(neighbor(a)) - center(neighbor(b)) || a.index - b.index)
  const total = edges.reduce((sum, edge) => sum + edge.width, 0)
  let y = center(node) - total / 2
  for (const edge of edges) {
    if (outgoing) edge.sourceY = y + edge.width / 2
    else edge.targetY = y + edge.width / 2
    y += edge.width
  }
}

function valueText(value: number): string {
  return String(value >= 0.01 && value < 1e12 ? Math.round(value * 100) / 100 : Number(value.toPrecision(5)))
}

function labelValue(node: PlacedSankeyNode, chart: SankeyChartOptions): string {
  const prefix = typeof chart.prefix === 'string' ? chart.prefix : ''
  const suffix = typeof chart.suffix === 'string' ? chart.suffix : ''
  return `${prefix}${valueText(node.value)}${suffix}`
}

function alignmentFor(value: unknown): SankeyAlignment {
  return value === 'left' || value === 'right' || value === 'center' ? value : 'justify'
}

export function layoutSankey(chart: SankeyChartOptions): SankeyLayout | undefined {
  const data = graph(chart)
  if (!data) return
  const { nodes, edges } = data
  const layers = layersFor(nodes, alignmentFor(chart.nodeAlignment))
  if (!layers) return
  for (const node of nodes) {
    const total = (edges: FlowEdge[]) => edges.reduce((sum, edge) => sum + edge.value, 0)
    node.value = Math.max(total(node.incoming), total(node.outgoing))
  }
  const maxValue = Math.max(...nodes.map(node => node.value))
  if (!Number.isFinite(maxValue) || maxValue <= 0) return
  const width = Math.round(boundedNumber(chart.width, 180, 3000) ?? 780)
  const requestedWidth = boundedNumber(chart.nodeWidth, 1, 120) ?? 10
  const widestLayer = Math.max(...layers.map(layer => layer.length))
  const nodeWidth = Math.min(requestedWidth, (width - 36) / layers.length / 2)
  const showValues = chart.showValues !== false
  const requestedPadding = (boundedNumber(chart.nodePadding, 0, 120) ?? 12) + (showValues ? 15 : 0)
  const top = chart.title ? 44 : 20
  const margin = 18
  const preferredHeight = Math.min(1600, Math.max(400, widestLayer * (requestedPadding + 10) + top + margin))
  const height = Math.round(boundedNumber(chart.height, 120, 3000) ?? preferredHeight)
  const available = height - top - margin
  const padding = Math.min(requestedPadding, available * 0.7 / Math.max(1, widestLayer - 1))
  const scale = Math.min(...layers.filter(layer => layer.some(node => node.value > 0)).map(layer =>
    (available - (layer.length - 1) * padding) / layer.reduce((sum, node) => sum + node.value / maxValue, 0)))
  for (const edge of edges) edge.width = (edge.value / maxValue) * scale
  const maxLabel = Math.max(...nodes.map(node => Math.max(node.label.length, showValues ? labelValue(node, chart).length : 0)))
  const gutter = chart.labelStyle === 'outlined' ? Math.min(width * 0.24, maxLabel * 7 + 14) : margin
  const step = (width - 2 * gutter - nodeWidth) / (layers.length - 1)
  for (const node of nodes) {
    node.x = gutter + step * node.layer
    node.height = (node.value / maxValue) * scale
  }
  alignLinks(layers, top, available, padding)
  for (const node of nodes) {
    positionPorts(node, node.incoming, false)
    positionPorts(node, node.outgoing, true)
  }

  // Keep adjacency internal. The public layout is serializable and can be reused without a DOM.
  const placed = nodes.map(({ id, label, color, layer, value, x, y, height }) => ({ id, label, color, layer, value, x, y, height }))
  const links = edges.map(({ source, target, value, color, width, sourceY, targetY }) => ({
    source: placed[source.index], target: placed[target.index], value, color, width, sourceY, targetY,
  }))
  return { width, height, nodeWidth, nodes: placed, links }
}

/** Accept CSS color functions containing channels and percentages, with no CSS identifiers or escapes. */
function paint(value: unknown): string | undefined {
  if (typeof value === 'string' && /^(?:rgba?|hsla?)\(\s*[\d+\-.,%/ \t]+\)$/i.test(value)) return value
  return safeColor(value)
}

export function sankeyChart(chart: SankeyChartOptions): string | undefined {
  const layout = layoutSankey(chart)
  if (!layout) return
  const { width, height, nodes, links, nodeWidth } = layout
  const id = chartPrefix(chart.idPrefix)
  const central = nodes.reduce((largest, node) => node.value > largest.value ? node : largest)
  const outlined = chart.labelStyle === 'outlined'
  const opacity = boundedNumber(chart.linkOpacity, 0, 1) ?? 0.55
  const color = chart.linkColor ?? 'gradient'
  const labelColor = paint(chart.labelColor)
  const outlineColor = paint(chart.backgroundColor) ?? 'var(--diagram-background, #1b2028)'
  const gradients: string[] = []
  const linkPaths = links.map(({ source, target, value, width, sourceY, targetY, color: override }, index) => {
    const start = source.x + nodeWidth
    const end = target.x
    const halfway = (start + end) / 2
    let stroke: string
    if (override) stroke = override
    else if (color === 'source' || color === 'target') stroke = (color === 'source' ? source : target).color
    else if (color === 'gradient') {
      const gradient = `${id}-sankey-${index}`
      gradients.push(`<linearGradient id="${gradient}" gradientUnits="userSpaceOnUse" x1="${start}" x2="${end}"><stop offset="0%" stop-color="${source.color}"/><stop offset="100%" stop-color="${target.color}"/></linearGradient>`)
      stroke = `url(#${gradient})`
    }
    else stroke = paint(color) ?? 'currentColor'
    const title = escapeHtml(`${source.label} → ${target.label}: ${valueText(value)}`)
    return `<path class="diagram-sankey-link" data-source="${escapeHtml(source.id)}" data-target="${escapeHtml(target.id)}" data-value="${value}" d="M${start} ${sourceY}C${halfway} ${sourceY} ${halfway} ${targetY} ${end} ${targetY}" stroke="${stroke}" stroke-width="${width}"><title>${title}</title></path>`
  }).join('')
  const blocks = nodes.map(({ id, label, x, y, height, value, color, layer }) => {
    const details = escapeHtml(`${label}: ${valueText(value)}`)
    return `<rect class="diagram-sankey-node" data-node-id="${escapeHtml(id)}" data-layer="${layer}" x="${x}" y="${y}" width="${nodeWidth}" height="${height}" fill="${color}"><title>${details}</title></rect>`
  }).join('')
  const labels = nodes.map((node) => {
    const right = outlined ? node.layer >= central.layer : node.x < width / 2
    const x = right ? node.x + nodeWidth + 6 : node.x - 6
    const lines = [node.label.replace(/\r?\n/g, ' ')]
    if (chart.showValues !== false) lines.push(labelValue(node, chart))
    const room = Math.max(1, Math.floor((right ? width - x - 4 : x - 4) / 7.6))
    const truncated = lines.map(line => line.length > room ? line.slice(0, room - 1) + '…' : line)
    const text = svgTextLines(truncated, x, center(node), 'diagram-sankey-label', right ? 'start' : 'end', 'currentColor', { color: labelColor })
    const stroke = outlined ? ` stroke="${outlineColor}" stroke-width="3" stroke-linejoin="round" paint-order="stroke fill"` : ''
    return `<g${stroke}><title>${escapeHtml(lines.join(' · '))}</title>${text}</g>`
  }).join('')
  const body = `<g data-diagram-kind="sankey" data-alignment="${alignmentFor(chart.nodeAlignment)}"><defs>${gradients.join('')}</defs><g class="diagram-sankey-links" fill="none" stroke-opacity="${opacity}">${linkPaths}</g>${blocks}${labels}</g>`
  const svg = chronologySvg(chart, id, 'Sankey diagram', width, height, body, 22, { background: chart.backgroundColor })
  return chart.useMaxWidth === false ? svg.replace('<svg ', `<svg width="${width}" height="${height}" `) : svg
}
