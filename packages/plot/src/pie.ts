import arc from '../../shape/src/arc.ts'
import type { ChartLabels } from './chronology.ts'
import { chartPrefix, chronologyColor, chronologyInk, chronologySvg, safeColor } from './chronology.ts'
import { escapeHtml, svgText, svgTextLines } from './diagram-svg.ts'

export interface PieSlice { label: string, value: number, color?: string }
export interface PieChartOptions extends ChartLabels {
  slices: readonly PieSlice[]
  showData?: boolean
  donutHole?: number
  textPosition?: number
  legendPosition?: 'left' | 'right' | 'bottom'
  highlightSlice?: string
}

export function pieChart(chart: PieChartOptions): string | undefined {
  const { slices: data, title } = chart
  if (!data.length || data.length > 40 || data.some(slice => !slice.label.trim() || !Number.isFinite(slice.value) || slice.value <= 0)) return
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (!Number.isFinite(total)) return
  const sliceColor = (index: number) => safeColor(data[index].color) ?? chronologyColor(index)
  const donut = typeof chart.donutHole === 'number' && Number.isFinite(chart.donutHole) ? Math.min(0.9, Math.max(0, chart.donutHole)) : 0
  const labelRadius = typeof chart.textPosition === 'number' && Number.isFinite(chart.textPosition)
    ? Math.max(donut, Math.min(1, chart.textPosition)) : Math.max(0.7, (donut + 1) / 2)
  const side = chart.legendPosition
  const radius = 130
  const offset = title ? 56 : 26
  const legendWidth = Math.max(...data.map(item => (item.label.length + (chart.showData ? String(item.value).length + 3 : 0)) * 8 + 50))
  const chartWidth = radius * 2 + 52
  const width = side === 'bottom' ? Math.max(chartWidth, legendWidth + 20) : chartWidth + legendWidth
  const left = side === 'left' ? legendWidth : 0
  const chartX = side === 'bottom' ? width / 2 : left + chartWidth / 2
  const chartY = offset + radius
  const legendHeight = data.length * 25
  const legendX = side === 'bottom' ? (width - legendWidth) / 2 + 10 : side === 'left' ? 15 : chartWidth + 2
  const legendY = side === 'bottom' ? chartY + radius + 24 : Math.max(offset, chartY - legendHeight / 2)
  const height = Math.max(chartY + radius + 24, legendY + legendHeight + 12)
  let angle = 0
  const shape = arc()
  const wedges = data.map((slice, index) => {
    const percent = slice.value / total * 100
    const color = sliceColor(index)
    const end = angle + Math.PI * 2 * percent / 100
    const center = (angle + end - Math.PI) / 2
    const wedge = shape({ innerRadius: radius * donut, outerRadius: radius, startAngle: angle, endAngle: end })
    angle = end
    const highlighted = chart.highlightSlice === slice.label
    const title = escapeHtml(`${slice.label}: ${slice.value}`)
    const text = percent >= 5
      ? svgTextLines([`${Math.round(percent)}%`], Math.cos(center) * radius * labelRadius, Math.sin(center) * radius * labelRadius, 'diagram-pie-percent', 'middle', chronologyInk)
      : ''
    return `<g class="diagram-pie-slice${highlighted ? ' diagram-pie-highlight' : ''}"><title>${title}</title><path d="${wedge}" fill="${color}" stroke="currentColor" stroke-opacity=".45" stroke-width="${highlighted ? 2.5 : 1}"/>${text}</g>`
  }).join('')
  const legend = data.map((item, index) => {
    const y = legendY + index * 25
    const label = chart.showData ? `${item.label} [${item.value}]` : item.label
    return `<rect x="${legendX}" y="${y}" width="15" height="15" rx="2" fill="${sliceColor(index)}"/>${svgText(label, legendX + 24, y + 8, '', 'start')}`
  }).join('')
  return chronologySvg(chart, chartPrefix(chart.idPrefix), 'Pie chart', width, height,
    `<g data-diagram-kind="pie"><g transform="translate(${chartX} ${chartY})">${wedges}</g>${legend}</g>`)
}
