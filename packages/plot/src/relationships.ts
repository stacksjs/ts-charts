import { edgePath, layeredLayout } from '../../graph/src/layered.ts'
import type { ChartLabels } from './chronology.ts'
import { chartPrefix, chronologySvg } from './chronology.ts'
import { arrows, svgText } from './diagram-svg.ts'

export type RelationshipMarker = 'arrow' | 'triangle' | 'composition' | 'aggregation' | 'one' | 'zero-one' | 'many' | 'zero-many'
export interface RelationshipCard { id: string, name?: string, fields?: readonly string[], operations?: readonly string[], annotation?: string }
export interface RelationshipEdge {
  source: string
  target: string
  label?: string
  start?: RelationshipMarker
  end?: RelationshipMarker
  dashed?: boolean
  leftCount?: string
  rightCount?: string
}
export interface RelationshipChartOptions extends ChartLabels {
  cards: readonly RelationshipCard[]
  edges: readonly RelationshipEdge[]
  kind?: 'class' | 'er'
  direction?: 'down' | 'up' | 'right' | 'left'
}

const markerGeometry = {
  triangle: '<path class="diagram-marker-open" fill="white" stroke="currentColor" d="M4 1L16 7L4 13Z"/>',
  composition: '<path class="diagram-marker-solid" fill="currentColor" d="M2 7L9 2L16 7L9 12Z"/>',
  aggregation: '<path class="diagram-marker-open" fill="white" stroke="currentColor" d="M2 7L9 2L16 7L9 12Z"/>',
  one: '<path class="diagram-edge" stroke="currentColor" fill="none" d="M7 2v10m5-10v10"/>',
  'zero-one': '<path class="diagram-edge" stroke="currentColor" fill="none" d="M12 2v10"/><circle class="diagram-marker-open" fill="white" stroke="currentColor" cx="6" cy="7" r="3"/>',
  many: '<path class="diagram-edge" stroke="currentColor" fill="none" d="M4 2v10m4-5 8-5m-8 5 8 5"/>',
  'zero-many': '<path class="diagram-edge" stroke="currentColor" fill="none" d="M8 7l8-5M8 7l8 5"/><circle class="diagram-marker-open" fill="white" stroke="currentColor" cx="4" cy="7" r="3"/>',
}
const relationshipTips = new Set<string>(Object.keys(markerGeometry))

function markers(id: string): string {
  return `<defs>${Object.entries(markerGeometry).map(([kind, svg]) =>
    `<marker id="${id}-${kind}" viewBox="0 0 17 14" refX="16" refY="7" markerWidth="17" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto-start-reverse">${svg}</marker>`,
  ).join('')}</defs>`
}

export function relationshipChart(chart: RelationshipChartOptions): string | undefined {
  if (!chart.cards.length || chart.cards.length > 100 || chart.edges.length > 300) return
  const cards = new Map(chart.cards.map(record => [record.id, {
    ...record, name: record.name ?? record.id, fields: record.fields ?? [], operations: record.operations ?? [],
  }]))
  const { edges } = chart
  if (cards.size !== chart.cards.length || chart.cards.some(card => !card.id.trim())
    || edges.some(edge => !cards.has(edge.source) || !cards.has(edge.target))) return
  const marker = chartPrefix(chart.idPrefix)
  const direction = chart.direction ?? 'down'
  const layout = layeredLayout({
    nodes: [...cards].map(([id, record]) => ({
      id,
      width: Math.max(132, ...[record.name, record.annotation ?? '', ...record.fields, ...record.operations].map(text => text.length * 8 + 35)),
      height: 38 + (record.annotation ? 19 : 0) + (record.fields.length + record.operations.length) * 22
        + (record.fields.length ? 13 : 0) + (record.operations.length ? 13 : 0),
    })),
    edges: [...edges],
  }, { direction, padding: 26, layerGap: 92, nodeGap: 40 })

  const pairOf = (source: string, target: string) => JSON.stringify([source, target])
  const edgeIndex = new Map<string, RelationshipEdge[]>()
  for (const edge of edges) {
    const key = pairOf(edge.source, edge.target)
    const list = edgeIndex.get(key) ?? []
    list.push(edge)
    edgeIndex.set(key, list)
  }
  const markerAttribute = (side: 'start' | 'end', tip: RelationshipMarker | undefined) => {
    if (tip === 'arrow') return ` marker-${side}="url(#${marker})"`
    if (tip && relationshipTips.has(tip)) return ` marker-${side}="url(#${marker}-${tip})"`
    return ''
  }
  const links = layout.edges.map((edge) => {
    const entry = edgeIndex.get(pairOf(edge.source, edge.target))?.shift()
    if (!entry || edge.points.length < 2) return ''
    const path = edgePath(edge.points, { direction, curve: 'orthogonal' })
    const start = markerAttribute('start', entry.start)
    const end = markerAttribute('end', entry.end)
    const first = edge.points[0]
    const last = edge.points.at(-1)!
    const center = edge.points[Math.floor(edge.points.length / 2)] ?? first
    const before = edge.points[Math.max(0, Math.floor(edge.points.length / 2) - 1)]
    const label = entry.label ? svgText(entry.label, (center.x + before.x) / 2 + (center.x === before.x ? 8 : 0), (center.y + before.y) / 2 - 9, 'diagram-edge-label', center.x === before.x ? 'start' : 'middle') : ''
    const multiplicity = (value: string | undefined, point: { x: number, y: number }, other: { x: number, y: number }) =>
      value ? svgText(value, point.x + Math.sign(other.x - point.x) * 18 + 10, point.y + Math.sign(other.y - point.y) * 18 - 10, 'diagram-edge-label') : ''
    return `<path class="diagram-edge${entry.dashed ? ' diagram-edge-dotted' : ''}" fill="none" stroke="currentColor"${entry.dashed ? ' stroke-dasharray="5 4"' : ''} d="${path}"${start}${end}/>${label}${multiplicity(entry.leftCount, first, edge.points[1])}${multiplicity(entry.rightCount, last, edge.points.at(-2)!)}`
  })
  const nodes = layout.nodes.map((node) => {
    const record = cards.get(node.id)!
    const { x, y, width, height } = node
    const center = x + width / 2
    let row = y + 6
    const annotation = record.annotation ? svgText(`«${record.annotation}»`, center, row += 12, 'diagram-card-annotation') : ''
    const title = svgText(record.name, center, row += 19, 'diagram-card-title')
    const separator = () => `<line class="diagram-card-divider" stroke="currentColor" stroke-opacity=".5" x1="${x}" x2="${x + width}" y1="${row += 13}" y2="${row}"/>`
    function members(values: readonly string[]): string {
      if (!values.length) return ''
      return separator() + values.map(value => svgText(value, x + 12, row += 22, 'diagram-card-member', 'start')).join('')
    }
    return `<g class="diagram-card diagram-node"><rect fill="currentColor" fill-opacity=".08" stroke="currentColor" x="${x}" y="${y}" width="${width}" height="${height}" rx="6"/>${annotation}${title}${members(record.fields)}${members(record.operations)}</g>`
  })
  const offset = chart.title ? 36 : 0
  const kind = chart.kind === 'er' ? 'er' : 'class'
  const description = kind === 'er' ? 'Entity relationship diagram' : 'Class diagram'
  return chronologySvg(chart, marker, description, layout.width, layout.height + offset,
    arrows(marker) + markers(marker) + `<g data-diagram-kind="${kind}" transform="translate(0 ${offset})">${links.join('')}${nodes.join('')}</g>`)
}
