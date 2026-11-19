import { edgePath, layeredLayout } from '../../graph/src/layered.ts'
import type { ChartLabels } from './chronology.ts'
import { chartPrefix, chronologySvg, wrappedLabel } from './chronology.ts'
import { arrows, escapeHtml, svgTextLines } from './diagram-svg.ts'

export interface FlowchartNode {
  id: string
  label?: string
  shape?: 'box' | 'rounded' | 'diamond'
}

export interface FlowchartEdge {
  from: string
  to: string
  label?: string
}

export interface FlowchartDiagramOptions extends ChartLabels {
  nodes: readonly FlowchartNode[]
  edges: readonly FlowchartEdge[]
  direction?: 'down' | 'up' | 'right' | 'left'
}

export function flowchartDiagram(chart: FlowchartDiagramOptions): string | undefined {
  if (!chart.nodes.length || chart.nodes.length > 200 || chart.edges.length > 300) return
  const nodes = new Map(chart.nodes.map(node => [node.id, node]))
  if (nodes.size !== chart.nodes.length || chart.nodes.some(node => !node.id.trim())) return
  if (chart.edges.some(edge => !nodes.has(edge.from) || !nodes.has(edge.to))) return
  const labels = new Map(chart.nodes.map(node => [node.id, wrappedLabel(node.label ?? node.id, 18)]))
  const directed = chart.edges.filter(edge => edge.from !== edge.to)
  const edges = directed.map(edge => ({ source: edge.from, target: edge.to }))
  const result = layeredLayout({
    nodes: chart.nodes.map(node => ({
      id: node.id,
      width: node.shape === 'diamond' ? 182 : 154,
      height: labels.get(node.id)!.length * 16 + (node.shape === 'diamond' ? 60 : 30),
    })),
    edges,
  }, { direction: chart.direction, padding: 30, layerGap: 95, nodeGap: 40 })
  const id = chartPrefix(chart.idPrefix)
  const offset = chart.title ? 37 : 0
  const links = result.edges.map((route, index) => {
    const label = directed[index]?.label
    const points = route.points
    const midpoint = points[Math.floor((points.length - 1) / 2)]
    const next = points[Math.min(Math.floor((points.length - 1) / 2) + 1, points.length - 1)]
    const labelX = (midpoint.x + next.x) / 2
    const labelY = (midpoint.y + next.y) / 2
    const caption = label ? svgTextLines(wrappedLabel(label, 17), labelX + 9, labelY - 12, 'diagram-edge-label') : ''
    return `<path fill="none" stroke="currentColor" stroke-width="1.5" class="diagram-edge" d="${edgePath(points, { direction: chart.direction })}" marker-end="url(#${id})"/>${caption}`
  }).join('')
  const positions = new Map(result.nodes.map(node => [node.id, node]))
  const loops = chart.edges.filter(edge => edge.from === edge.to).map((edge) => {
    const { x, y, width, height } = positions.get(edge.from)!
    const right = x + width
    const center = x + width / 2
    const curve = `M${right} ${y + height / 2} C${right + 25} ${y + height / 2} ${right + 25} ${y - 18} ${center} ${y - 18} Q${center - 5} ${y - 18} ${center} ${y}`
    const caption = edge.label ? svgTextLines(wrappedLabel(edge.label, 17), center, y - 22, 'diagram-edge-label') : ''
    return `<path fill="none" stroke="currentColor" class="diagram-edge" d="${curve}" marker-end="url(#${id})"/>${caption}`
  }).join('')
  const boxes = result.nodes.map((placed) => {
    const { x, y, width, height } = placed
    const shape = nodes.get(placed.id)?.shape
    const center = x + width / 2
    const middle = y + height / 2
    const attrs = 'fill="#e5edf6" stroke="#44617c" stroke-width="1.5"'
    const outline = shape === 'diamond'
      ? `<polygon ${attrs} points="${center},${y} ${x + width},${middle} ${center},${y + height} ${x},${middle}"/>`
      : `<rect ${attrs} x="${x}" y="${y}" width="${width}" height="${height}" rx="${shape === 'rounded' ? 15 : 5}"/>`
    const text = svgTextLines(labels.get(placed.id)!, center, middle, 'diagram-node-label', 'middle', '#122434')
    return `<g class="diagram-node" data-node-id="${escapeHtml(placed.id)}">${outline}${text}</g>`
  }).join('')
  const markup = `${arrows(id)}<g data-diagram-kind="flowchart" transform="translate(0 ${offset})">${links}${loops}${boxes}</g>`
  return chronologySvg(chart, id, 'Flowchart', result.width, result.height + offset, markup)
}
