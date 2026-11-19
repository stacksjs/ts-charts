import type { ChartLabels } from './chronology.ts'
import { chartPrefix, chronologySvg, wrappedLabel } from './chronology.ts'
import { arrows, svgText, svgTextLines } from './diagram-svg.ts'

export interface SequenceParticipant { id: string, name?: string, actor?: boolean }
export type SequenceEvent =
  | { kind: 'message', from: string, to: string, arrow?: 'arrow' | 'both' | 'cross' | 'none', dashed?: boolean, label: string, change?: 'start' | 'end' }
  | { kind: 'note', ids: readonly string[], position?: 'left of' | 'right of' | 'over', label: string }
  | { kind: 'activate' | 'deactivate', id: string }
  | { kind: 'section' | 'branch', title: string }
  | { kind: 'end' }

export interface SequenceChartOptions extends ChartLabels {
  participants: readonly SequenceParticipant[]
  events: readonly SequenceEvent[]
  numbered?: boolean
}

interface Activity { id: string, start: number, offset: number }
interface Section { kind: string, title: string, top: number, depth: number }

export function sequenceChart(chart: SequenceChartOptions): string | undefined {
  const { events, numbered } = chart
  if (!chart.participants.length || chart.participants.length > 28 || events.length > 200) return
  const participants = new Map(chart.participants.map(item => [item.id, { ...item, name: item.name ?? item.id }]))
  if (participants.size !== chart.participants.length || chart.participants.some(item => !item.id.trim())) return
  for (const event of events) {
    switch (event.kind) {
      case 'message':
        if (!participants.has(event.from) || !participants.has(event.to)) return
        break
      case 'activate':
      case 'deactivate':
        if (!participants.has(event.id)) return
        break
      case 'note':
        if (!event.ids.length || event.ids.some(id => !participants.has(id))) return
        break
      case 'section':
      case 'branch':
      case 'end':
        break
      default:
        return
    }
  }
  const marker = chartPrefix(chart.idPrefix)
  const names = [...participants]
  const actorLabels = new Map(names.map(([id, item]) => [id, wrappedLabel(item.name, 24)]))
  const span = Math.max(172, ...[...actorLabels.values()].map(lines => Math.max(...lines.map(line => line.length)) * 8 + 60))
  const extraHeader = Math.max(0, ...[...actorLabels.values()].map(lines => lines.length - 1)) * 16
  const longestMessage = Math.max(0, ...events.map(event => 'label' in event ? Math.max(...wrappedLabel(event.label, 52).map(line => line.length)) : 0))
  const column = Math.max(span, Math.min(490, longestMessage * 7 + 38))
  const margin = column / 2 + 48
  const width = margin * 2 + (names.length - 1) * column
  const xOf = new Map(names.map(([id], index) => [id, margin + index * column]))
  let y = 113 + extraHeader
  let number = 1
  const foreground: string[] = []
  const sectionBoxes: string[] = []
  const activeBars: string[] = []
  const sections: Section[] = []
  const activity: Activity[] = []

  function finish(id: string, bottom: number): void {
    const index = activity.findLastIndex(item => item.id === id)
    if (index < 0) return
    const [bar] = activity.splice(index, 1)
    const x = xOf.get(id)! - 5 + bar.offset
    activeBars.push(`<rect class="diagram-activation" fill="#b5d2ef" stroke="#44617c" x="${x}" y="${bar.start}" width="10" height="${Math.max(8, bottom - bar.start)}"/>`)
  }
  function activate(id: string, top: number): void {
    activity.push({ id, start: top, offset: activity.filter(entry => entry.id === id).length * 6 })
  }
  for (const event of events) {
    if (event.kind === 'activate' || event.kind === 'deactivate') {
      if (event.kind === 'activate') activate(event.id, y - 13)
      else finish(event.id, y - 13)
      continue
    }
    if (event.kind === 'section') {
      if (sections.length >= 8) return
      const [kind, ...description] = event.title.split(/\s+/)
      sections.push({ kind, title: description.join(' '), top: y - 12, depth: sections.length })
      y += 33
      continue
    }
    if (event.kind === 'branch') {
      const section = sections.at(-1)
      if (!section) return
      const x = 12 + section.depth * 12
      foreground.push(`<path class="diagram-edge diagram-edge-dotted" fill="none" stroke="currentColor" stroke-dasharray="5 4" d="M${x} ${y}H${width - x}"/>${svgText(event.title, x + 8, y + 12, 'diagram-cluster-label', 'start')}`)
      y += 35
      continue
    }
    if (event.kind === 'end') {
      const section = sections.pop()
      if (!section) return
      const x = 12 + section.depth * 12
      sectionBoxes.unshift(`<g class="diagram-sequence-section"><rect fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-dasharray="4 3" x="${x}" y="${section.top}" width="${width - x * 2}" height="${y - section.top}" rx="4"/>${svgText(`${section.kind} ${section.title}`.trim(), x + 9, section.top + 12, 'diagram-cluster-label', 'start')}</g>`)
      y += 21
      continue
    }
    if (event.kind === 'note') {
      const lines = wrappedLabel(event.label, Math.min(52, Math.floor((width - 36) / 8)))
      const noteWidth = Math.max(90, ...lines.map(line => line.length * 7 + 24))
      const first = xOf.get(event.ids[0])!
      const last = xOf.get(event.ids.at(-1)!)!
      const preferred = event.position === 'left of' ? first - noteWidth - 18 : event.position === 'right of' ? first + 18 : (first + last - noteWidth) / 2
      const x = Math.max(6, Math.min(width - noteWidth - 6, preferred))
      const height = lines.length * 16 + 13
      foreground.push(`<g class="diagram-sequence-note"><rect fill="currentColor" fill-opacity=".13" stroke="currentColor" x="${x}" y="${y}" width="${noteWidth}" height="${height}" rx="4"/>${svgTextLines(lines, x + noteWidth / 2, y + height / 2)}</g>`)
      y += height + 23
      continue
    }
    if (event.kind !== 'message') continue
    const from = xOf.get(event.from)!
    const to = xOf.get(event.to)!
    const label = numbered ? `${number++}. ${event.label}` : event.label
    const self = from === to
    const lines = wrappedLabel(label, self ? Math.max(10, Math.floor((margin - 52) / 8)) : 52)
    const labelHeight = lines.length * 16
    const line = y + labelHeight + 4
    const d = self ? `M${from} ${line}h37v19h-37` : `M${from} ${line}H${to}`
    const end = event.arrow === 'cross' ? ` marker-end="url(#${marker}-cross)"` : event.arrow === undefined || event.arrow === 'arrow' || event.arrow === 'both' ? ` marker-end="url(#${marker})"` : ''
    const start = event.arrow === 'both' ? ` marker-start="url(#${marker})"` : ''
    if (event.change === 'start') activate(event.to, line)
    if (event.change === 'end') finish(event.from, line)
    foreground.push(`<path class="diagram-edge${event.dashed ? ' diagram-edge-dotted' : ''}" fill="none" stroke="currentColor"${event.dashed ? ' stroke-dasharray="5 4"' : ''} d="${d}"${start}${end}/>${svgTextLines(lines, self ? from + 46 : (from + to) / 2, y + labelHeight / 2, 'diagram-edge-label', self ? 'start' : 'middle')}`)
    y = line + (self ? 45 : 29)
  }
  if (sections.length) return
  const bottom = y + 9
  for (const entry of [...activity]) finish(entry.id, bottom)
  const lifelines = names.map(([id, participant]) => {
    const x = xOf.get(id)!
    const actor = participant.actor
      ? `<path class="diagram-edge" fill="none" stroke="currentColor" d="M${x} 22v20m-11 -15h22m-11 15l-10 12m10 -12l10 12"/><circle class="diagram-cross" fill="none" stroke="currentColor" cx="${x}" cy="15" r="7"/>`
      : `<rect class="diagram-participant" fill="currentColor" fill-opacity=".1" stroke="currentColor" x="${x - span / 2 + 10}" y="17" width="${span - 20}" height="${64 + extraHeader}" rx="6"/>`
    return `<path class="diagram-lifeline" stroke="currentColor" stroke-opacity=".55" stroke-dasharray="5 4" d="M${x} ${actor ? 88 : 81}V${bottom}"/>${actor}${svgTextLines(actorLabels.get(id)!, x, (actor ? 71 : 49) + extraHeader / 2)}`
  })
  const offset = chart.title ? 36 : 0
  const content = sectionBoxes.join('') + lifelines.join('') + activeBars.join('') + foreground.join('')
  return chronologySvg(chart, marker, 'Sequence diagram', width, bottom + 21 + offset,
    arrows(marker) + `<g data-diagram-kind="sequence" transform="translate(0 ${offset})">${content}</g>`)
}
