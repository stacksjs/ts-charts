import ticks from '../../array/src/ticks.ts'
import type { ChartLabels } from './chronology.ts'
import { boundedNumber, chartPrefix, chronologyColor, chronologySvg, safeColor } from './chronology.ts'
import { escapeHtml, svgText } from './diagram-svg.ts'

type Domain = readonly [number, number]

export interface XYPoint { value: number, label?: string }
export interface XYSeries {
  type: 'line' | 'bar'
  label?: string
  color?: string
  values: readonly (number | XYPoint)[]
}

export interface XYAxisOptions {
  title?: string
  domain?: Domain
  showLabel?: boolean
  showTitle?: boolean
  showTick?: boolean
  showAxisLine?: boolean
  labelFontSize?: number
  labelPadding?: number
  labelRotation?: number
  titleFontSize?: number
  titlePadding?: number
  tickLength?: number
  tickWidth?: number
  axisLineWidth?: number
  labelColor?: string
  titleColor?: string
  tickColor?: string
  lineColor?: string
}

export interface XYChartOptions extends ChartLabels {
  series: readonly XYSeries[]
  xAxis?: XYAxisOptions & { categories?: readonly string[] }
  yAxis?: XYAxisOptions
  orientation?: 'vertical' | 'horizontal'
  width?: number
  height?: number
  showTitle?: boolean
  titleFontSize?: number
  titlePadding?: number
  showLegend?: boolean
  legendFontSize?: number
  legendPadding?: number
  showDataLabel?: boolean
  showDataLabelOutsideBar?: boolean
  plotReservedSpacePercent?: number
  colors?: readonly string[]
  backgroundColor?: string
  titleColor?: string
  dataLabelColor?: string
  legendTextColor?: string
}

interface Tick { text: string, position: number }
interface Box { left: number, right: number, top: number, bottom: number }
interface PlottedSeries extends Omit<XYSeries, 'values' | 'color'> { values: XYPoint[], color: string }

function validDomain(value: unknown): value is Domain {
  return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite)
    && value[0] < value[1] && Number.isFinite(value[1] - value[0])
}

const valueLabel = (value: number): string => String(Number(value.toPrecision(10)))
const font = (value: unknown, fallback: number): number => boundedNumber(value, 6, 72) ?? fallback
const length = (value: unknown, fallback: number): number => boundedNumber(value, 0, 70) ?? fallback
const textWidth = (text: string, size: number): number => Array.from(text).length * size * 0.6
const clamp = (value: number): number => Math.max(0, Math.min(1, value))

function numericTicks([min, max]: Domain, count: number): Tick[] {
  const span = max - min
  const values = span >= 1e-200 && span <= 1e200 ? ticks(min, max, count) : []
  return (values.length >= 2 ? values : [min, max]).map(value => ({ text: valueLabel(value), position: (value - min) / span }))
}

function axisLayout(config: XYAxisOptions | undefined, values: Tick[], side: 'left' | 'bottom', limit: number) {
  const axis = config ?? {}
  const leftSide = side === 'left'
  const title = axis.showTitle !== false ? axis.title : undefined
  const labelFont = font(axis.labelFontSize, 14)
  const titleFont = font(axis.titleFontSize, 16)
  const widest = Math.max(0, ...values.map(value => textWidth(value.text, labelFont)))
  const rotation = leftSide ? 0 : boundedNumber(axis.labelRotation, -90, 90) ?? 0
  const rotated = widest * Math.abs(Math.sin(rotation * Math.PI / 180))
  const tickLength = axis.showTick === false ? 0 : length(axis.tickLength, 5)
  const gap = tickLength + length(axis.labelPadding, 5)
  const extent = axis.showLabel === false ? tickLength : gap + (leftSide ? widest : labelFont + rotated)
  const space = Math.min(limit, extent + (title ? titleFont + length(axis.titlePadding, 5) : 0) + 16)
  return {
    space,
    render(box: Box, invert = false): string {
      const { left, top, bottom, right } = box
      const axisLine = leftSide ? `M${left} ${top}V${bottom}` : `M${left} ${bottom}H${right}`
      const line = axis.showAxisLine === false ? '' : `<path class="diagram-xy-axis-line" d="${axisLine}" stroke="${safeColor(axis.lineColor) ?? 'currentColor'}" stroke-width="${length(axis.axisLineWidth, 2)}"/>`
      const labelColor = safeColor(axis.labelColor)
      const tickColor = safeColor(axis.tickColor) ?? 'currentColor'
      const marks = values.map(({ text, position }) => {
        const ratio = invert ? 1 - position : position
        const x = leftSide ? left : left + (right - left) * ratio
        const y = leftSide ? top + (bottom - top) * ratio : bottom
        const tickPath = leftSide ? `h${-tickLength}` : `v${tickLength}`
        const tick = tickLength === 0 ? '' : `<path class="diagram-xy-tick" d="M${x} ${y}${tickPath}" stroke="${tickColor}" stroke-width="${length(axis.tickWidth, 2)}"/>`
        if (axis.showLabel === false) return tick
        const anchor = leftSide || rotation < 0 ? 'end' : rotation > 0 ? 'start' : 'middle'
        const tx = leftSide ? x - gap : x
        const ty = leftSide ? y : y + gap + labelFont / 2
        const label = svgText(text, 0, 0, 'diagram-xy-axis-label', anchor, { fontSize: labelFont, color: labelColor })
        const rotate = rotation ? ` rotate(${rotation})` : ''
        return `${tick}<g transform="translate(${tx} ${ty})${rotate}">${label}</g>`
      }).join('')
      let caption = ''
      if (title) {
        const x = leftSide ? left - space + 9 : (left + right) / 2
        const y = leftSide ? (top + bottom) / 2 : bottom + space - 9
        const label = svgText(title, 0, 0, 'diagram-xy-axis-title', 'middle', { fontSize: titleFont, color: safeColor(axis.titleColor) })
        caption = `<g transform="translate(${x} ${y})${leftSide ? ' rotate(-90)' : ''}">${label}</g>`
      }
      return `<g class="diagram-xy-axis" data-axis-side="${side}" fill="none">${line}${marks}${caption}</g>`
    },
  }
}

function legendLayout(chart: XYChartOptions, series: PlottedSeries[], width: number) {
  let x = 16
  let row = 0
  const size = font(chart.legendFontSize, 14)
  const padding = length(chart.legendPadding, 10)
  const line = size + 8
  const items = chart.showLegend === false ? [] : series.filter(item => item.label).map((item) => {
    const label = item.label!
    const limit = Math.max(10, Math.floor((width - 73) / (size * 0.6)))
    const visible = label.length > limit ? label.slice(0, limit - 1) + '…' : label
    const itemWidth = textWidth(visible, size) + 45
    if (x + itemWidth > width - 16 && x > 16) {
      row++
      x = 16
    }
    const position = { item, label: visible, x, row }
    x += itemWidth
    return position
  })
  return {
    height: items.length ? (row + 1) * line + padding * 2 : 0,
    render(top: number): string {
      if (!items.length) return ''
      const color = safeColor(chart.legendTextColor)
      const entries = items.map(({ item, label, x, row }) => {
        const y = top + padding + line * (row + 0.5)
        const mark = item.type === 'line'
          ? `<path d="M${x} ${y}h21" fill="none" stroke="${item.color}" stroke-width="3"/>`
          : `<rect x="${x + 3}" y="${y - 6}" width="15" height="12" fill="${item.color}"/>`
        return `<g><title>${escapeHtml(item.label!)}</title>${mark}${svgText(label, x + 28, y, '', 'start', { color, fontSize: size })}</g>`
      }).join('')
      return `<g class="diagram-xy-legend">${entries}</g>`
    },
  }
}

function prepareSeries(chart: XYChartOptions, slots?: number): PlottedSeries[] | undefined {
  if (!Array.isArray(chart.series) || !chart.series.length || chart.series.length > 40) return
  let count = 0
  const result: PlottedSeries[] = []
  const palette = chart.colors
  for (const [index, item] of chart.series.entries()) {
    if (!item || (item.type !== 'line' && item.type !== 'bar') || !Array.isArray(item.values) || !item.values.length) return
    const values = Array.from(item.values.slice(0, slots) as readonly (number | XYPoint)[], point => typeof point === 'number' ? { value: point } : point)
    count += values.length
    if (count > 3600 || values.length > 400 || values.some(point => !point || !Number.isFinite(point.value))) return
    const color = safeColor(item.color) ?? (palette?.length ? safeColor(palette[index % palette.length]) : undefined) ?? chronologyColor(index)
    result.push({ values, type: item.type, color, label: typeof item.label === 'string' ? item.label.trim() : undefined })
  }
  return result
}

export function xyChart(chart: XYChartOptions): string | undefined {
  const { xAxis, yAxis } = chart
  const categories = xAxis?.categories
  if (categories !== undefined && (!Array.isArray(categories) || !categories.length || categories.length > 400
    || Array.from(categories).some(label => typeof label !== 'string' || !label.trim()))) return
  if (xAxis?.domain !== undefined && !validDomain(xAxis.domain)) return
  if (yAxis?.domain !== undefined && !validDomain(yAxis.domain)) return
  const series = prepareSeries(chart, categories?.length)
  if (!series) return
  const horizontal = chart.orientation === 'horizontal'
  const bars = series.filter(item => item.type === 'bar').length
  const count = categories?.length ?? Math.max(...series.map(item => item.values.length))
  const values = series.flatMap(item => item.values.map(point => point.value))
  const min = Math.min(...values, ...(bars ? [0] : []))
  const max = Math.max(...values, ...(bars ? [0] : []))
  const pad = min === max ? Math.max(0.5, Math.abs(min) * 0.1) : 0
  const domain = yAxis?.domain ?? [min - pad, max + pad]
  const xDomain: Domain = xAxis?.domain ?? (count === 1 ? [0.5, 1.5] : [1, count])
  if (!validDomain(domain)) return

  const width = Math.round(boundedNumber(chart.width, 220, 2400) ?? 700)
  const height = Math.round(boundedNumber(chart.height, 180, 2000) ?? 500)
  const legend = legendLayout(chart, series, width)
  const title = chart.showTitle !== false && typeof chart.title === 'string' ? chart.title : ''
  const titleSize = font(chart.titleFontSize, 20)
  const padding = length(chart.titlePadding, 10)
  const titleHeight = title ? titleSize + padding * 2 : 0
  const inset = bars && !categories ? Math.min(0.5 / count, 0.38) : 0
  const insetX = (unit: number) => inset + unit * (1 - 2 * inset)
  const xTicks = categories
    ? categories.map((text, index) => ({ text, position: (index + 0.5) / count }))
    : numericTicks(xDomain, horizontal ? 8 : 7).map(tick => ({ ...tick, position: insetX(tick.position) }))
  const yTicks = numericTicks(domain, horizontal ? 7 : 6)
  const reserve = (boundedNumber(chart.plotReservedSpacePercent, 10, 90) ?? 50) / 100
  const left = axisLayout(horizontal ? xAxis : yAxis, horizontal ? xTicks : yTicks, 'left', width * (1 - reserve))
  const bottom = axisLayout(horizontal ? yAxis : xAxis, horizontal ? yTicks : xTicks, 'bottom', height * (1 - reserve))
  const box = { left: Math.max(24, left.space), top: 16 + titleHeight, right: width - 23, bottom: height - bottom.space - legend.height }
  if (box.bottom - box.top < 20) return
  const across = box.right - box.left
  const down = box.bottom - box.top
  const span = horizontal ? down : across
  const barStep = 0.76 * span / count / Math.max(1, bars)
  const barWidth = barStep * 0.92
  const scale = (value: number) => clamp((value - domain[0]) / (domain[1] - domain[0]))
  const baseline = scale(0)
  const point = (category: number, value: number) => horizontal
    ? { x: box.left + value * across, y: box.top + category * down }
    : { x: box.left + category * across, y: box.bottom - value * down }
  const grid = yTicks.map(({ position }) => {
    const { x, y } = point(0, position)
    const path = horizontal ? `M${x} ${box.top}V${box.bottom}` : `M${box.left} ${y}H${box.right}`
    return `<path class="diagram-xy-grid" d="${path}" fill="none" stroke="currentColor" stroke-opacity="0.16"/>`
  }).join('')

  let barIndex = 0
  const pointLabels: string[] = []
  const plots = series.map((item, index) => {
    const bar = item.type === 'bar'
    const shift = bar ? (barIndex++ - (bars - 1) / 2) * barStep / span : 0
    const positions = item.values.map(({ value }, index) => {
      const category = categories ? (index + 0.5) / count
        : insetX(item.values.length === 1 ? (count === 1 && !xAxis?.domain ? 0.5 : 0) : index / (item.values.length - 1))
      return { ...point(category + shift, scale(value)), from: point(category + shift, baseline) }
    })
    const marks = item.values.map(({ value, label }, index) => {
      const { x, y, from } = positions[index]
      const caption = bar ? chart.showDataLabel && valueLabel(value) : typeof label === 'string' && label
      if (caption) {
        const outside = !bar || chart.showDataLabelOutsideBar
        const positive = !bar || scale(value) >= baseline
        const tx = horizontal ? outside ? x + (positive ? 8 : -8) : (x + from.x) / 2 : x
        const ty = horizontal ? y : outside ? y + (positive ? -10 : 10) : (y + from.y) / 2
        const anchor = horizontal && outside ? positive ? 'start' : 'end' : 'middle'
        const color = bar ? safeColor(chart.dataLabelColor) ?? (outside ? undefined : '#122434') : item.color
        pointLabels.push(svgText(caption, tx, ty, 'diagram-xy-value', anchor, { fontSize: 12, color }))
      }
      const description = escapeHtml([item.label, categories?.[index], valueLabel(value)].filter(Boolean).join(' · '))
      const attrs = `data-point="${index}" data-value="${value}"`
      if (!bar) return `<circle class="diagram-xy-point" cx="${x}" cy="${y}" r="${label || positions.length === 1 ? 3 : 2}" fill="${item.color}" ${attrs}><title>${description}</title></circle>`
      const left = horizontal ? Math.min(from.x, x) : x - barWidth / 2
      const top = horizontal ? y - barWidth / 2 : Math.min(from.y, y)
      const width = horizontal ? Math.abs(x - from.x) : barWidth
      const height = horizontal ? barWidth : Math.abs(y - from.y)
      return `<rect class="diagram-xy-bar" x="${left}" y="${top}" width="${width}" height="${height}" fill="${item.color}" ${attrs}><title>${description}</title></rect>`
    }).join('')
    const line = !bar && positions.length > 1
      ? `<polyline class="diagram-xy-line" points="${positions.map(({ x, y }) => [x, y].join(',')).join(' ')}" fill="none" stroke="${item.color}" stroke-width="2.5" stroke-linejoin="round"/>` : ''
    return `<g data-series="${index}" data-series-type="${item.type}">${line}${marks}</g>`
  }).join('')
  const id = chartPrefix(chart.idPrefix)
  const clip = `<defs><clipPath id="${id}-xy-plot"><rect x="${box.left}" y="${box.top}" width="${across}" height="${down}"/></clipPath></defs>`
  const visualTitle = title ? svgText(title, width / 2, padding + titleSize / 2, 'diagram-title', 'middle',
    { fontSize: titleSize, color: safeColor(chart.titleColor) }) : ''
  const axes = left.render(box, !horizontal) + bottom.render(box)
  const body = `<g data-diagram-kind="xy" data-orientation="${horizontal ? 'horizontal' : 'vertical'}">${visualTitle}${clip}${grid}${axes}<g clip-path="url(#${id}-xy-plot)">${plots}</g>${pointLabels.join('')}${legend.render(height - legend.height)}</g>`
  return chronologySvg({ ...chart, title: '', accessibleTitle: chart.accessibleTitle || chart.title }, id, 'XY chart',
    width, height, body, undefined, { background: chart.backgroundColor })
}
