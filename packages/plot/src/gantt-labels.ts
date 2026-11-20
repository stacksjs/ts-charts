import { labelLines } from './diagram-svg.ts'

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

function glyphWidth(glyph: string, size: number): number {
  if (/^[ilI.,:!|' ]$/.test(glyph)) return size * 0.4
  if (/^[MWmw@%]$/.test(glyph)) return size
  return /^[\x00-\xff]$/.test(glyph) ? size * 0.75 : size * 1.2
}

interface Line { glyphs: string[], widths: number[], width: number }

function measureLine(text: string, size: number): Line {
  const glyphs = Array.from(graphemes.segment(text), ({ segment }) => segment)
  const widths = glyphs.map(glyph => glyphWidth(glyph, size))
  return { glyphs, widths, width: widths.reduce((total, width) => total + width, 0) }
}

function wrapLine({ glyphs, widths }: Line, limit: number): string[] {
  if (!glyphs.length) return ['']
  const lines: string[] = []
  for (let start = 0; start < glyphs.length;) {
    let end = start
    let space = -1
    let width = 0
    while (end < glyphs.length && (end === start || width + widths[end] <= limit)) {
      if (/^\s$/u.test(glyphs[end])) space = end
      width += widths[end++]
    }
    if (end < glyphs.length && space > start && !/^\s$/u.test(glyphs[end])) end = space
    lines.push(glyphs.slice(start, end).join('').trimEnd())
    start = end
    while (start < glyphs.length && /^\s$/u.test(glyphs[start])) start++
  }
  return lines
}

export interface GanttTaskLabel {
  lines: string[]
  x: number
  anchor: 'start' | 'middle' | 'end'
  offset: number
  height: number
  left: number
  right: number
}

export function layoutTaskLabel(
  name: string,
  { left, right, milestone }: { left: number, right: number, milestone: boolean },
  { width, barHeight, fontSize }: { width: number, barHeight: number, fontSize?: number },
  neighbors?: { left: number, right: number },
): GanttTaskLabel {
  const size = fontSize ?? 14
  const lineHeight = fontSize === undefined ? 16 : fontSize * 1.15
  const source = labelLines(name)
  const measured = source.map(line => measureLine(line, size))
  const longest = Math.max(...measured.map(line => line.width))
  const gap = 8
  const before = left - gap * 2
  const after = width - right - gap * 2
  const inside = !milestone && longest <= right - left - 2 * gap && (source.length === 1 || source.length * lineHeight <= barHeight)
  if (inside) {
    const x = (left + right) / 2
    return { lines: source, x, anchor: 'middle', offset: 0, height: source.length * lineHeight, left: x - longest / 2, right: x + longest / 2 }
  }

  const fitsBetween = neighbors && longest <= neighbors.right - right - gap * 2
  const fitsBefore = neighbors && longest <= left - neighbors.left - gap * 2
  const putAfter = fitsBetween || (!fitsBefore && (longest <= after || (longest > before && after >= before)))
  const available = putAfter ? after : before
  // Move labels below wide bars when neither side provides room to wrap.
  const below = longest > available && available < size * 7
  const lines = longest <= available ? source : measured.flatMap(line => wrapLine(line, below ? width - 2 * gap : available))
  const height = lines.length * lineHeight
  const textWidth = lines === source ? longest : Math.max(...lines.map(line => measureLine(line, size).width))
  if (below) {
    const x = Math.max(gap + textWidth / 2, Math.min(width - gap - textWidth / 2, (left + right) / 2))
    return { lines, x, anchor: 'middle', offset: barHeight / 2 + 4 + height / 2, height, left: x - textWidth / 2, right: x + textWidth / 2 }
  }
  const x = putAfter ? right + gap : left - gap
  const textLeft = putAfter ? x : x - textWidth
  return { lines, x, anchor: putAfter ? 'start' : 'end', offset: 0, height, left: textLeft, right: textLeft + textWidth }
}
