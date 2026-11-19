import { edgePath, layeredLayout } from '../../graph/src/layered.ts'
import type { ChartLabels } from './chronology.ts'
import { chartPrefix, chronologyInk, chronologySvg, safeColor, wrappedLabel } from './chronology.ts'
import { arrows, escapeHtml, svgTextLines } from './diagram-svg.ts'

export type FlowchartShape = 'box' | 'rounded' | 'diamond' | 'circle' | 'stadium' | 'database' | 'double' | 'hexagon' | 'state'
export type FlowchartMarker = 'arrow' | 'circle' | 'cross' | 'none'
export interface FlowchartStyle {
  fill?: string
  stroke?: string
  color?: string
  strokeWidth?: number
  strokeDasharray?: string
}

export interface FlowchartNode {
  id: string
  label?: string
  shape?: FlowchartShape
  style?: FlowchartStyle
}

export interface FlowchartEdge {
  from: string
  to: string
  label?: string
  style?: 'normal' | 'dotted' | 'thick'
  start?: FlowchartMarker
  end?: FlowchartMarker
}

export interface FlowchartGroup {
  label: string
  members: readonly string[]
  depth?: number
}

export interface FlowchartDiagramOptions extends ChartLabels {
  nodes: readonly FlowchartNode[]
  edges: readonly FlowchartEdge[]
  groups?: readonly FlowchartGroup[]
  kind?: 'flowchart' | 'state'
  direction?: 'down' | 'up' | 'right' | 'left'
  routing?: 'curved' | 'orthogonal'
}

function nodePaint(style?: FlowchartStyle): string {
  const width = style?.strokeWidth
  const values = {
    fill: safeColor(style?.fill),
    stroke: safeColor(style?.stroke),
    color: safeColor(style?.color),
    'stroke-width': typeof width === 'number' && width > 0 && width <= 20 ? width : undefined,
    'stroke-dasharray': typeof style?.strokeDasharray === 'string' && /^[\d., ]{1,48}$/.test(style.strokeDasharray) ? style.strokeDasharray : undefined,
  }
  return Object.entries(values).flatMap(([key, value]) => value === undefined ? [] : [`--diagram-${key}:${value}`]).join(';')
}

function nodeOutline(shape: FlowchartShape | undefined, x: number, y: number, w: number, h: number, style?: FlowchartStyle): string {
  const cx = x + w / 2
  const cy = y + h / 2
  const attrs = `fill="${safeColor(style?.fill) ?? '#e5edf6'}" stroke="${safeColor(style?.stroke) ?? '#44617c'}" stroke-width="1.5"`
  const rect = (rx: number) => `<rect ${attrs} x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`
  switch (shape) {
    case 'diamond':
      return `<polygon ${attrs} points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}"/>`
    case 'circle':
    case 'state':
      return `<ellipse ${attrs} cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}"/>`
    case 'stadium':
      return rect(h / 2)
    case 'database':
      return `<path ${attrs} d="M ${x} ${y + 9}a${w / 2} 9 0 0 1 ${w} 0v${h - 18}a${w / 2} 9 0 0 1 -${w} 0z M ${x} ${y + 9}a${w / 2} 9 0 0 0 ${w} 0"/>`
    case 'double':
      return rect(5) + `<path ${attrs} d="M ${x + 8} ${y}v${h}M ${x + w - 8} ${y}v${h}"/>`
    case 'hexagon':
      return `<polygon ${attrs} points="${x + 16},${y} ${x + w - 16},${y} ${x + w},${cy} ${x + w - 16},${y + h} ${x + 16},${y + h} ${x},${cy}"/>`
    default:
      return rect(shape === 'rounded' ? 15 : 5)
  }
}

function drawEdge(edge: FlowchartEdge, marker: string, path: string, labelX: number, labelY: number): string {
  const tip = (side: 'start' | 'end', value: FlowchartMarker) => {
    if (value === 'arrow') return ` marker-${side}="url(#${marker})"`
    if (value === 'circle' || value === 'cross') return ` marker-${side}="url(#${marker}-${value})"`
    return ''
  }
  const style = edge.style === 'thick' || edge.style === 'dotted' ? edge.style : 'normal'
  const caption = edge.label ? svgTextLines(wrappedLabel(edge.label, 17), labelX, labelY, 'diagram-edge-label') : ''
  return `<path fill="none" stroke="currentColor" stroke-width="${style === 'thick' ? 3.2 : 1.5}" class="diagram-edge diagram-edge-${style}"${style === 'dotted' ? ' stroke-dasharray="5 4"' : ''} d="${path}"${tip('start', edge.start ?? 'none')}${tip('end', edge.end ?? 'arrow')}/>${caption}`
}

export function flowchartDiagram(chart: FlowchartDiagramOptions): string | undefined {
  const groups = (chart.groups ?? []).map(group => ({ ...group, depth: group.depth ?? 0 }))
  if (!chart.nodes.length || chart.nodes.length > 200 || chart.edges.length > 600 || groups.length > 80) return
  const nodes = new Map(chart.nodes.map(node => [node.id, node]))
  if (nodes.size !== chart.nodes.length || chart.nodes.some(node => !node.id.trim())) return
  if (chart.edges.some(edge => !nodes.has(edge.from) || !nodes.has(edge.to))) return
  if (groups.some(group => !Number.isInteger(group.depth) || group.depth < 0 || group.depth > 7
    || !group.members.length || group.members.some(member => !nodes.has(member)))) return
  const labels = new Map(chart.nodes.map(node => [node.id, wrappedLabel(node.label ?? node.id, 18)]))
  const directed = chart.edges.filter(edge => edge.from !== edge.to)
  const loopEdges = chart.edges.filter(edge => edge.from === edge.to)
  const loopTotals = new Map<string, number>()
  for (const edge of loopEdges) loopTotals.set(edge.from, (loopTotals.get(edge.from) ?? 0) + 1)
  const depth = Math.max(0, ...groups.map(group => group.depth))
  const padding = Math.max(30, groups.length ? 47 + depth * 10 : 0, loopEdges.length ? 27 + 10 * Math.max(...loopTotals.values()) : 0)
  const result = layeredLayout({
    nodes: chart.nodes.map(node => {
      const width = node.shape === 'diamond' ? 182 : 154
      const height = labels.get(node.id)!.length * 16 + (node.shape === 'diamond' ? 60 : 30)
      if (node.shape === 'state') return { id: node.id, width: 26, height: 26 }
      if (node.shape === 'circle') return { id: node.id, width, height: Math.max(width, height) }
      return { id: node.id, width, height }
    }),
    edges: directed.map(edge => ({ source: edge.from, target: edge.to })),
  }, { direction: chart.direction, padding, layerGap: 95, nodeGap: 40 })
  const id = chartPrefix(chart.idPrefix)
  const offset = chart.title ? 37 : 0
  const positions = new Map(result.nodes.map(node => [node.id, node]))
  const clusters = groups.sort((a, b) => a.depth - b.depth).map((group) => {
    const members = group.members.map(member => positions.get(member)!)
    const inset = 16 + (depth - group.depth) * 10
    const x = Math.min(...members.map(box => box.x)) - inset
    const y = Math.min(...members.map(box => box.y)) - inset - 16
    const right = Math.max(...members.map(box => box.x + box.width)) + inset
    const bottom = Math.max(...members.map(box => box.y + box.height)) + inset
    const title = svgTextLines(wrappedLabel(group.label, Math.max(10, Math.floor((right - x - 24) / 8))), x + 12, y + 14, 'diagram-cluster-label', 'start')
    return `<g class="diagram-cluster"><rect x="${x}" y="${y}" width="${right - x}" height="${bottom - y}" rx="8" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-dasharray="4 3"/>${title}</g>`
  }).join('')
  const pairOf = (from: string, to: string) => JSON.stringify(from < to ? [from, to] : [to, from])
  const parallel = new Map<string, number>()
  for (const edge of directed) {
    const key = pairOf(edge.from, edge.to)
    parallel.set(key, (parallel.get(key) ?? 0) + 1)
  }
  const lanes = new Map<string, number>()
  const links = result.edges.map((route, index) => {
    const key = pairOf(route.source, route.target)
    const count = parallel.get(key) ?? 1
    const points = [...route.points]
    if (count > 1 && points.length === 2) {
      const lane = lanes.get(key) ?? 0
      lanes.set(key, lane + 1)
      const separation = (lane - (count - 1) / 2) * Math.min(30, 120 / count)
      const [start, end] = points
      const horizontal = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)
      points.splice(1, 0, {
        x: (start.x + end.x) / 2 + (horizontal ? 0 : separation),
        y: (start.y + end.y) / 2 + (horizontal ? separation : 0),
      })
    }
    const middle = Math.floor((points.length - 1) / 2)
    const before = points[middle]
    const after = points[points.length % 2 ? middle : middle + 1]
    return drawEdge(directed[index], id, edgePath(points, { direction: chart.direction, curve: chart.routing === 'orthogonal' ? 'orthogonal' : undefined }),
      (before.x + after.x) / 2 + 9, (before.y + after.y) / 2 - 12)
  }).join('')
  const loopIndex = new Map<string, number>()
  const loops = loopEdges.map((edge) => {
    const { x, y, width, height } = positions.get(edge.from)!
    const index = loopIndex.get(edge.from) ?? 0
    loopIndex.set(edge.from, index + 1)
    const right = x + width
    const center = x + width / 2
    const top = y - 18 - index * 10
    const bow = right + 25 + index * 10
    const curve = `M ${right} ${y + height / 2} C ${bow} ${y + height / 2} ${bow} ${top} ${center} ${top} Q ${center - 5} ${top} ${center} ${y}`
    return drawEdge(edge, id, curve, center, top - 4)
  }).join('')
  const boxes = result.nodes.map(({ id: nodeId, x, y, width, height }) => {
    const { shape, style } = nodes.get(nodeId)!
    const paint = nodePaint(style)
    const text = svgTextLines(labels.get(nodeId)!, x + width / 2, y + height / 2, 'diagram-node-label', 'middle', safeColor(style?.color) ?? chronologyInk)
    return `<g class="diagram-node" data-node-id="${escapeHtml(nodeId)}"${paint ? ` style="${paint}"` : ''}>${nodeOutline(shape, x, y, width, height, style)}${text}</g>`
  }).join('')
  const kind = chart.kind === 'state' ? 'state' : 'flowchart'
  const markup = `${arrows(id)}<g data-diagram-kind="${kind}" transform="translate(0 ${offset})">${clusters}${links}${loops}${boxes}</g>`
  return chronologySvg(chart, id, kind === 'state' ? 'State diagram' : 'Flowchart', result.width, result.height + offset, markup)
}
