export function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll('\'', '&#39;')
}

export function labelLines(label: string): string[] {
  return label.trim().replace(/^"|"$/g, '').split(/<br\s*\/?>/i)
}

interface TextAppearance { color?: string, fontSize?: number }

export function svgText(label: string, x: number, y: number, classes = '', anchor = 'middle', appearance?: TextAppearance): string {
  return svgTextLines(labelLines(label), x, y, classes, anchor, 'currentColor', appearance)
}

export function svgTextLines(lines: string[], x: number, y: number, classes = '', anchor = 'middle', fill = 'currentColor', appearance?: TextAppearance): string {
  const { color, fontSize } = appearance ?? {}
  const lineHeight = fontSize === undefined ? 16 : fontSize * 1.15
  const dy = -(lines.length - 1) * lineHeight / 2
  const style = (color ? `fill:${color};` : '') + (fontSize ? `font-size:${fontSize}px;` : '')
  return `<text fill="${fill}" x="${x}" y="${y}" class="${classes}" text-anchor="${anchor}" dominant-baseline="central"${style ? ` style="${style}"` : ''}>${lines.map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : dy}">${escapeHtml(line)}</tspan>`).join('')}</text>`
}

export function diagramSvg(label: string, width: number, height: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="slide-diagram" font-family="system-ui, sans-serif" font-size="14" fill="currentColor" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label)}">${body}</svg>`
}

export function arrows(marker: string): string {
  return `<defs>
    <marker id="${marker}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path fill="currentColor" class="diagram-arrow" d="M0 0L8 4L0 8Z"/></marker>
    <marker id="${marker}-circle" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><circle fill="currentColor" class="diagram-arrow" cx="4" cy="4" r="2.8"/></marker>
    <marker id="${marker}-cross" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path stroke="currentColor" class="diagram-cross" d="M1 1L7 7M7 1L1 7"/></marker>
  </defs>`
}
