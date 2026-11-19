export * from './diagrams.ts'

import { scaleLinear } from '@ts-charts/scale'
import { area, curveLinear, curveMonotoneX, curveStepAfter, line } from '@ts-charts/shape'

/**
 * High-level charts, rendered to a string of SVG.
 *
 * The rest of ts-charts is D3's toolbox: scales, shapes, axes, each one
 * piece of a chart. This package assembles the pieces into finished charts
 * with opinions about how they should look, and returns markup rather than
 * mutating a DOM, so the same call renders on a server, in a worker, or in
 * a browser behind `innerHTML`.
 */

/** How a series is drawn between its points. */
export type PlotCurve = 'step' | 'linear' | 'monotone'

/** One line on a probability chart. */
export interface ProbabilitySeries {
  /** Stable id, used for gradient ids and to key labels. */
  id: string
  /** Shown beside the line's last value, e.g. a team's abbreviation. */
  label: string
  /** Any CSS colour: the line, its fill, its dot and its label. */
  color: string
  /** `[time, value]` pairs, oldest first. Time in any increasing unit; value from 0 to 1. */
  points: ReadonlyArray<readonly [number, number]>
  /** Shade the area under the line. Defaults to true. */
  fill?: boolean
}

export interface ProbabilityChartOptions {
  series: readonly ProbabilitySeries[]
  /** Pixel width of the whole chart, labels included. */
  width: number
  /** Pixel height of the whole chart. */
  height: number
  /** Pixels reserved on the right for the end labels. 0 draws none. Defaults to 120. */
  labelWidth?: number
  /** Defaults to `step`, the way an order book's last price moves. */
  curve?: PlotCurve
  /** The time span drawn. Defaults to the data's own span. */
  domain?: readonly [number, number]
  /** The value span drawn. Defaults to 0 to 1. */
  yDomain?: readonly [number, number]
  /** Hold each line's last value out to this time, typically now. Defaults to the domain's end. */
  extendTo?: number
  /** Dashed reference lines at these values. Defaults to none. */
  grid?: readonly number[]
  /** Formats a value for its end label. Defaults to a whole percent. */
  format?: (value: number) => string
  /** Opacity at the top of an area's gradient. Defaults to 0.18. */
  fillOpacity?: number
  /** Defaults to 2.5. */
  strokeWidth?: number
  /** Inner padding in pixels. */
  padding?: { top?: number, bottom?: number, left?: number }
  /** Text announced for the chart; the labels' values are appended. */
  title?: string
  /** Defaults to `inherit`. */
  fontFamily?: string
  /** Colour for grid lines. Defaults to `currentColor` at low opacity. */
  gridColor?: string
  /** Prefix for gradient ids, to keep two charts on one page apart. */
  idPrefix?: string
}

/** Where a series' end label landed, for callers that draw labels themselves. */
export interface EndLabel {
  id: string
  label: string
  color: string
  value: number | null
  text: string
  /** Vertical centre of the label, in pixels from the top. */
  y: number
  /** Vertical position of the line's last value, which the label may have moved off. */
  anchorY: number
}

export interface ProbabilityChart {
  svg: string
  labels: EndLabel[]
  width: number
  height: number
}

const CURVES = {
  step: curveStepAfter,
  linear: curveLinear,
  monotone: curveMonotoneX,
}

/** Height one end label needs: a name line above a large value. */
const LABEL_HEIGHT = 46

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function defaultFormat(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Space labels at least `gap` apart while keeping each as close to where it
 * wants to be as the bounds allow.
 *
 * Two outcomes priced 52% and 48% would print one label over the other.
 * Labels are placed in order, each pushed down off the one above; the
 * stack is then pushed back up if it ran off the bottom, and clamped at the
 * top. The result keeps the original order.
 */
export function resolveLabelPositions(desired: readonly number[], gap: number, top: number, bottom: number): number[] {
  const order = desired.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y)
  const placed = order.map(item => item.y)

  for (let i = 0; i < placed.length; i++) {
    const floor = i === 0 ? top : placed[i - 1]! + gap
    placed[i] = Math.max(placed[i]!, floor)
  }
  for (let i = placed.length - 1; i >= 0; i--) {
    const ceiling = i === placed.length - 1 ? bottom : placed[i + 1]! - gap
    placed[i] = Math.min(placed[i]!, ceiling)
  }
  for (let i = 0; i < placed.length; i++)
    placed[i] = Math.max(placed[i]!, top)

  const out: number[] = Array.from({ length: desired.length }, () => 0)
  order.forEach((item, rank) => {
    out[item.index] = placed[rank]!
  })
  return out
}

/**
 * A chart of how likely each outcome has been over time, the way a
 * prediction market draws a game: one line per outcome in its own colour,
 * a soft fill beneath, a dot on the latest value and, to the right, each
 * outcome's name over its current probability.
 *
 * ```ts
 * const { svg } = probabilityChart({
 *   width: 720,
 *   height: 320,
 *   series: [
 *     { id: 'lal', label: 'LAL', color: '#552583', points: lakers },
 *     { id: 'cha', label: 'CHA', color: '#1d1160', points: hornets },
 *   ],
 * })
 * element.innerHTML = svg
 * ```
 *
 * Sized in real pixels rather than stretched by a viewBox, so text and
 * strokes stay crisp: re-render on resize.
 */
export function probabilityChart(options: ProbabilityChartOptions): ProbabilityChart {
  const width = Math.max(1, Math.floor(options.width))
  const height = Math.max(1, Math.floor(options.height))
  const labelWidth = Math.max(0, options.labelWidth ?? 120)
  const top = options.padding?.top ?? 16
  const bottom = height - (options.padding?.bottom ?? 16)
  const left = options.padding?.left ?? 0
  const right = width - labelWidth - (labelWidth > 0 ? 16 : 0)
  const format = options.format ?? defaultFormat
  const prefix = (options.idPrefix ?? 'plot').replace(/[^\w-]/g, '')
  const fillOpacity = options.fillOpacity ?? 0.18
  const strokeWidth = options.strokeWidth ?? 2.5

  const drawn = options.series.filter(series => series.points.length > 0)
  const times = drawn.flatMap(series => series.points.map(point => point[0]))
  const domain: [number, number] = options.domain
    ? [options.domain[0], options.domain[1]]
    : [Math.min(...times), Math.max(...times)]
  if (!(domain[1] > domain[0]))
    domain[1] = domain[0] + 1
  const yDomain: [number, number] = options.yDomain ? [options.yDomain[0], options.yDomain[1]] : [0, 1]
  const extendTo = options.extendTo ?? domain[1]

  const x = scaleLinear().domain(domain).range([left, right]).clamp(true) as unknown as (value: number) => number
  const y = scaleLinear().domain(yDomain).range([bottom, top]).clamp(true) as unknown as (value: number) => number
  const curve = CURVES[options.curve ?? 'step']

  const toLine = (line() as any).x((d: readonly [number, number]) => x(d[0])).y((d: readonly [number, number]) => y(d[1])).curve(curve).digits(2)
  const toArea = (area() as any).x((d: readonly [number, number]) => x(d[0])).y0(bottom).y1((d: readonly [number, number]) => y(d[1])).curve(curve).digits(2)

  const defs: string[] = []
  const layers: string[] = []
  const dots: string[] = []
  const anchors: Array<{ series: ProbabilitySeries, value: number | null, anchorY: number }> = []

  drawn.forEach((series, index) => {
    const points = series.points.filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]))
    if (points.length === 0)
      return
    const last = points[points.length - 1]!
    // Hold the latest value out to `extendTo` so the line reaches the
    // present instead of stopping at its last trade.
    const extended = last[0] < extendTo ? [...points, [extendTo, last[1]] as const] : points
    const color = escapeXml(series.color)
    const gradient = `${prefix}-fill-${index}`

    if (series.fill !== false) {
      defs.push(`<linearGradient id="${gradient}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="${fillOpacity}"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient>`)
      layers.push(`<path d="${toArea(extended)}" fill="url(#${gradient})" stroke="none"/>`)
    }
    layers.push(`<path d="${toLine(extended)}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round"/>`)

    const endX = round(x(Math.min(extendTo, domain[1])))
    const endY = round(y(last[1]))
    dots.push(`<circle cx="${endX}" cy="${endY}" r="${strokeWidth * 4}" fill="${color}" fill-opacity="0.16"/><circle cx="${endX}" cy="${endY}" r="${strokeWidth * 2}" fill="${color}"/>`)
    anchors.push({ series, value: last[1], anchorY: endY })
  })

  const grid = (options.grid ?? []).map((value) => {
    const gy = round(y(value))
    return `<line x1="${left}" x2="${round(right)}" y1="${gy}" y2="${gy}" stroke="${escapeXml(options.gridColor ?? 'currentColor')}" stroke-opacity="${options.gridColor ? 1 : 0.12}" stroke-dasharray="3 5"/>`
  })

  // End labels, spaced so close prices do not print over each other.
  const labelTop = top + LABEL_HEIGHT / 2
  const labelBottom = bottom - LABEL_HEIGHT / 2
  const positions = resolveLabelPositions(anchors.map(anchor => anchor.anchorY), LABEL_HEIGHT + 6, labelTop, Math.max(labelTop, labelBottom))
  const labels: EndLabel[] = anchors.map((anchor, index) => ({
    id: anchor.series.id,
    label: anchor.series.label,
    color: anchor.series.color,
    value: anchor.value,
    text: anchor.value === null ? '—' : format(anchor.value),
    y: round(positions[index]!),
    anchorY: anchor.anchorY,
  }))

  const labelX = round(right + 16)
  const labelMarkup = labelWidth > 0
    ? labels.map(label => `<g fill="${escapeXml(label.color)}"><text x="${labelX}" y="${round(label.y - 9)}" font-size="13" font-weight="600" letter-spacing="0.02em">${escapeXml(label.label)}</text><text x="${labelX}" y="${round(label.y + 19)}" font-size="30" font-weight="800" letter-spacing="-0.02em" style="font-variant-numeric: tabular-nums">${escapeXml(label.text)}</text></g>`).join('')
    : ''

  const summary = labels.map(label => `${label.label} ${label.text}`).join(', ')
  const title = escapeXml([options.title, summary].filter(Boolean).join(': '))
  const font = escapeXml(options.fontFamily ?? 'inherit')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}" font-family="${font}" style="display:block;overflow:visible">`
    + `<title>${title}</title>`
    + (defs.length ? `<defs>${defs.join('')}</defs>` : '')
    + grid.join('')
    + layers.join('')
    + dots.join('')
    + labelMarkup
    + `</svg>`

  return { svg, labels, width, height }
}
