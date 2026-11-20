import type { ChartLabels } from './chronology.ts'
import { boundedNumber, chartPrefix, chronologySvg, safeColor, wrappedLabel } from './chronology.ts'
import { escapeHtml, svgTextLines } from './diagram-svg.ts'

export interface QuadrantPointStyle {
  color?: string
  radius?: number
  strokeColor?: string
  strokeWidth?: number
}

export interface QuadrantPoint extends QuadrantPointStyle {
  label: string
  /** Inclusive normalized plot coordinates, with the origin at bottom left. */
  x: number
  y: number
}

export interface QuadrantPalette {
  background?: string
  fills?: readonly (string | undefined)[]
  labels?: readonly (string | undefined)[]
  point?: string
  pointLabel?: string
  xAxis?: string
  yAxis?: string
  internalBorder?: string
  externalBorder?: string
  title?: string
}

export interface QuadrantChartOptions extends ChartLabels {
  /** Labels in top-right, top-left, bottom-left, bottom-right order. */
  quadrants?: readonly string[]
  points?: readonly QuadrantPoint[]
  xAxis?: readonly [low: string, high?: string]
  yAxis?: readonly [low: string, high?: string]
  chartWidth?: number
  chartHeight?: number
  useMaxWidth?: boolean
  titleFontSize?: number
  titlePadding?: number
  quadrantPadding?: number
  quadrantLabelFontSize?: number
  quadrantTextTopPadding?: number
  quadrantInternalBorderStrokeWidth?: number
  quadrantExternalBorderStrokeWidth?: number
  xAxisLabelPadding?: number
  xAxisLabelFontSize?: number
  xAxisPosition?: 'top' | 'bottom'
  yAxisLabelPadding?: number
  yAxisLabelFontSize?: number
  yAxisPosition?: 'left' | 'right'
  pointTextPadding?: number
  pointLabelFontSize?: number
  pointRadius?: number
  palette?: QuadrantPalette
}

const defaultFills = ['#ececff', '#f1f1ff', '#f6f6ff', '#fbfbff']
const defaultLabels = ['#131300', '#0e0e00', '#090900', '#040400']
const ink = defaultLabels[0]

function font(value: number | undefined, fallback: number): number {
  return boundedNumber(value, 4, 96) ?? fallback
}

function label(value: string, x: number, y: number, width: number, size: number, color: string, classes: string, anchor = 'middle'): string {
  return svgTextLines(wrappedLabel(value, Math.max(1, Math.floor(width / (size * 0.61)))), x, y, classes, anchor, color, { fontSize: size, color })
}

function validLabels(values: unknown, limit: number): boolean {
  return Array.isArray(values) && values.length <= limit && values.every(text => typeof text === 'string' && text.length <= 512)
}

export function quadrantChart(chart: QuadrantChartOptions): string | undefined {
  const { points = [], quadrants = [], xAxis = [], yAxis = [], palette = {} } = chart
  if (!validLabels(quadrants, 4) || !validLabels(xAxis, 2) || !validLabels(yAxis, 2)) return
  if (!Array.isArray(points) || points.length > 240 || points.some(point => !point || typeof point.label !== 'string'
    || !point.label.trim() || point.label.length > 512
    || boundedNumber(point.x, 0, 1) === undefined || boundedNumber(point.y, 0, 1) === undefined)) return

  const width = boundedNumber(chart.chartWidth, 80, 6000) ?? 500
  const height = boundedNumber(chart.chartHeight, 80, 6000) ?? 500
  const titleSize = font(chart.titleFontSize, 20)
  const titlePadding = boundedNumber(chart.titlePadding, 0, 96) ?? 10
  const outer = boundedNumber(chart.quadrantPadding, 0, 96) ?? 5
  const xFont = font(chart.xAxisLabelFontSize, 16)
  const yFont = font(chart.yAxisLabelFontSize, 16)
  const xPadding = boundedNumber(chart.xAxisLabelPadding, 0, 96) ?? 5
  const yPadding = boundedNumber(chart.yAxisLabelPadding, 0, 96) ?? 5
  const xSpace = xAxis.some(Boolean) ? xFont + xPadding * 2 : 0
  const ySpace = yAxis.some(Boolean) ? yFont + yPadding * 2 : 0
  const titleSpace = chart.title ? titleSize + 2 * titlePadding : 0
  const xBottom = points.length > 0 || chart.xAxisPosition === 'bottom'
  const yRight = chart.yAxisPosition === 'right'
  const left = outer + (yRight ? 0 : ySpace)
  const top = outer + titleSpace + (xBottom ? 0 : xSpace)
  const plotWidth = width - outer * 2 - ySpace
  const plotHeight = height - outer * 2 - titleSpace - xSpace
  if (plotWidth < 24 || plotHeight < 24) return
  const halfWidth = plotWidth / 2
  const halfHeight = plotHeight / 2
  const middle = left + halfWidth
  const center = top + halfHeight
  const right = left + plotWidth
  const bottom = top + plotHeight

  const quadrantSize = font(chart.quadrantLabelFontSize, 16)
  const labelPadding = boundedNumber(chart.quadrantTextTopPadding, 0, 96) ?? 5
  const regions = [[middle, top], [left, top], [left, center], [middle, center]]
  const panels = regions.map(([x, y], index) => {
    const fill = safeColor(palette.fills?.[index]) ?? defaultFills[index]
    const textColor = safeColor(palette.labels?.[index]) ?? defaultLabels[index]
    const name = quadrants[index]
    const headingY = y + (points.length ? Math.min(halfHeight / 2, labelPadding + quadrantSize / 2) : halfHeight / 2)
    const heading = name ? label(name, x + halfWidth / 2, headingY, halfWidth - 8, quadrantSize, textColor, 'diagram-quadrant-label') : ''
    return `<g data-quadrant="${index + 1}"><rect x="${x}" y="${y}" width="${halfWidth}" height="${halfHeight}" fill="${fill}"/>${heading}</g>`
  })

  const innerStroke = boundedNumber(chart.quadrantInternalBorderStrokeWidth, 0, 32) ?? 1
  const outerStroke = boundedNumber(chart.quadrantExternalBorderStrokeWidth, 0, 32) ?? 2
  const grid = `<path class="diagram-quadrant-dividers" fill="none" stroke="${safeColor(palette.internalBorder) ?? '#c7c7f1'}" stroke-width="${innerStroke}" d="M${middle} ${top}V${bottom}M${left} ${center}H${right}"/>`
  const border = `<rect class="diagram-quadrant-border" x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" fill="none" stroke="${safeColor(palette.externalBorder) ?? '#c7c7f1'}" stroke-width="${outerStroke}"/>`

  const axes = [
    ...xAxis.map((name, index) => name
      ? label(name, xAxis[1] ? left + halfWidth * (index + 0.5) : left + 2, xBottom ? bottom + outer + xSpace / 2 : titleSpace + xSpace / 2,
        xAxis[1] ? halfWidth - 8 : plotWidth - 4, xFont, safeColor(palette.xAxis) ?? ink, 'diagram-quadrant-x-axis', xAxis[1] ? 'middle' : 'start') : ''),
    ...yAxis.map((name, index) => {
      if (!name) return ''
      const x = yRight ? right + outer + ySpace / 2 : ySpace / 2
      const y = yAxis[1] ? bottom - halfHeight * (index + 0.5) : bottom - 2
      const content = label(name, x, y, yAxis[1] ? halfHeight - 8 : plotHeight - 4,
        yFont, safeColor(palette.yAxis) ?? ink, 'diagram-quadrant-y-axis', yAxis[1] ? 'middle' : 'start')
      return `<g transform="rotate(-90 ${x} ${y})">${content}</g>`
    }),
  ]

  const pointSize = font(chart.pointLabelFontSize, 12)
  const pointPadding = boundedNumber(chart.pointTextPadding, 0, 96) ?? 5
  const defaultRadius = boundedNumber(chart.pointRadius, 0, 96) ?? 5
  const pointFill = safeColor(palette.point) ?? '#493b9d'
  const pointText = safeColor(palette.pointLabel) ?? ink
  const symbols = points.map((point) => {
    const x = left + plotWidth * point.x
    const y = top + plotHeight * (1 - point.y)
    const radius = boundedNumber(point.radius, 0, 96) ?? defaultRadius
    const strokeWidth = boundedNumber(point.strokeWidth, 0, 32) ?? 0
    const offset = radius + pointPadding + pointSize / 2
    const below = y + offset + pointSize / 2 <= bottom
    const padding = Math.min(plotWidth / 4, point.label.length * pointSize * 0.31 + 4)
    const textX = Math.min(right - padding, Math.max(left + padding, x))
    const textY = below ? y + offset : Math.max(top + pointSize / 2, y - offset)
    const text = label(point.label, textX, textY, Math.min(plotWidth / 2, padding * 2), pointSize, pointText, 'diagram-quadrant-point-label')
    return `<g data-point-x="${point.x}" data-point-y="${point.y}"><title>${escapeHtml(point.label)} (${point.x}, ${point.y})</title><circle class="diagram-quadrant-point" cx="${x}" cy="${y}" r="${radius}" fill="${safeColor(point.color) ?? pointFill}" stroke="${safeColor(point.strokeColor) ?? pointFill}" stroke-width="${strokeWidth}"/>${text}</g>`
  })
  const body = `<g data-diagram-kind="quadrant">${panels.join('')}${grid}${border}${axes.join('')}${symbols.join('')}</g>`
  const svg = chronologySvg(chart, chartPrefix(chart.idPrefix), 'Quadrant chart', width, height, body, titlePadding + titleSize / 2,
    { titleColor: safeColor(palette.title) ?? ink, titleFontSize: titleSize, background: safeColor(palette.background) ?? '#ffffff' })
  return chart.useMaxWidth === false ? svg.replace('<svg ', `<svg width="${width}" height="${height}" `) : svg
}
