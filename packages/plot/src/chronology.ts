import { diagramSvg, escapeHtml, labelLines, svgText } from './diagram-svg.ts'

export interface ChartLabels {
  title?: string
  accessibleTitle?: string
  description?: string
  /** Optional chart ID prefix. */
  idPrefix?: string
}

const colors = ['#8dbcf2', '#fed194', '#9ad9c0', '#c6adeb', '#f5a9b2', '#8cdae0',
  '#cddd8c', '#ffb696', '#9fb1ec', '#e4b5dd', '#b5d2ef', '#a7d6a3']
export const chronologyInk = '#122434'

export function safeColor(value: unknown): string | undefined {
  return typeof value === 'string' && /^(?:#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})|[a-z]{1,24})$/i.test(value) ? value : undefined
}

export function chronologyColor(index: number): string {
  return colors[index % colors.length]
}

export function wrappedLabel(label: string, limit: number): string[] {
  return labelLines(label).flatMap((line) => {
    let current = ''
    const wrapped: string[] = []
    for (const word of line.trim().split(/\s+/)) {
      if (current && current.length + word.length + 1 > limit) {
        wrapped.push(current)
        current = ''
      }
      const letters = Array.from(word)
      while (letters.length > limit) wrapped.push(letters.splice(0, limit).join(''))
      current += (current ? ' ' : '') + letters.join('')
    }
    return [...wrapped, current]
  })
}

export function chronologySvg(chart: ChartLabels, marker: string, kind: string, width: number, height: number, body: string): string {
  const id = escapeHtml(marker)
  const title = chart.title ? svgText(chart.title, width / 2, 20, 'diagram-title') : ''
  const accessibleTitle = chart.accessibleTitle ? `<title id="${id}-title">${escapeHtml(chart.accessibleTitle)}</title>` : ''
  const description = chart.description ? `<desc id="${id}-description">${escapeHtml(chart.description)}</desc>` : ''
  const label = chart.accessibleTitle || chart.title || kind
  return diagramSvg(label, width, height, accessibleTitle + description + title + body)
    .replace('role="img"', `role="img"${accessibleTitle ? ` aria-labelledby="${id}-title"` : ''}${description ? ` aria-describedby="${id}-description"` : ''}`)
}

let nextPrefix = 0

export function chartPrefix(requested: string | undefined): string {
  return requested?.replace(/[^\w-]/g, '') || `ts-chart-${++nextPrefix}`
}
