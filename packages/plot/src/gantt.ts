import type { ChartLabels } from './chronology.ts'
import { boundedNumber, chartPrefix, chronologyColor, chronologySvg, safeColor, titlePosition } from './chronology.ts'
import { escapeHtml, svgText } from './diagram-svg.ts'
import { dayMs, durationEnd, ganttAxisDate, ganttDateParser, ganttTicks, weekdays } from './gantt-time.ts'

export type GanttTaskTag = 'active' | 'done' | 'crit' | 'milestone' | 'vert'
export type GanttWeekday = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
const taskTags: ReadonlySet<string> = new Set(['active', 'done', 'crit', 'milestone', 'vert'])

export interface GanttTaskCallback {
  name: string
  /** Strings passed to the callback. Defaults to the task ID when omitted. */
  args?: readonly string[]
}

export interface GanttTask {
  id?: string
  name: string
  /** Explicit start date, or use after to depend on other tasks. */
  start?: string
  after?: readonly string[]
  /** An explicit end date, a duration, or the start of the earliest referenced task. */
  end?: string
  duration?: string
  until?: readonly string[]
  tags?: readonly GanttTaskTag[]
  href?: string
  callback?: GanttTaskCallback
}

export interface GanttSection { name?: string, tasks: readonly GanttTask[] }
export interface GanttMarkerStyle { stroke?: string, strokeWidth?: number, opacity?: number }
export interface GanttChartOptions extends ChartLabels {
  sections: readonly GanttSection[]
  dateFormat?: string
  axisFormat?: string
  tickInterval?: string
  excludes?: readonly string[]
  includes?: readonly string[]
  weekend?: 'friday' | 'saturday'
  weekday?: GanttWeekday
  topAxis?: boolean
  todayMarker?: boolean
  todayMarkerStyle?: GanttMarkerStyle
  inclusiveEndDates?: boolean
  displayMode?: 'compact'
  barHeight?: number
  barGap?: number
  width?: number
  titleTopMargin?: number
  topPadding?: number
  leftPadding?: number
  rightPadding?: number
  gridLineStartPadding?: number
  bottomMarginAdj?: number
  fontSize?: number
  sectionFontSize?: number
  numberSectionStyles?: number
  sectionColors?: readonly (string | undefined)[]
  /** UTC timestamp used by the today marker and by the first undated task. */
  now?: number
}

interface TaskDefinition {
  name: string
  section: number
  id: string
  input: GanttTask
  tags: readonly GanttTaskTag[]
  index: number
}

export interface ScheduledGanttTask extends TaskDefinition {
  start: number
  end: number
}

export interface GanttSchedule {
  tasks: ScheduledGanttTask[]
  sections: string[]
  title: string
  axisFormat: string
  ticks: string
  topAxis: boolean
  todayMarker: boolean
  isExcluded: (date: number) => boolean
}

/** Resolve tasks as a dependency graph so that until/after can refer forward. */
export function scheduleGantt(chart: GanttChartOptions): GanttSchedule | undefined {
  const {
    sections: groups, title = '', dateFormat = 'YYYY-MM-DD', axisFormat: format,
    tickInterval: ticks = '', topAxis = false, todayMarker = true,
    inclusiveEndDates = false, excludes = [], includes = [], now = Date.now(),
  } = chart
  if (!dateFormat || dateFormat.length > 72 || !Number.isFinite(now)) return
  if (chart.weekend && chart.weekend !== 'friday' && chart.weekend !== 'saturday') return
  const sections = groups.map(section => section.name ?? '')
  const weekend = chart.weekend === 'friday' ? 5 : 6
  const byId = new Map<string, TaskDefinition>()
  const definitions: TaskDefinition[] = []
  for (const [section, group] of groups.entries()) {
    for (const input of group.tasks) {
      const { name, id = '', tags = [], start, after, end, duration, until } = input
      if (!name?.trim() || definitions.length >= 180 || tags.some(tag => !taskTags.has(tag))) return
      if (id && (!/^[\w.-]+$/.test(id) || byId.has(id))) return
      if ((start !== undefined && after !== undefined) || (after !== undefined && !validReferences(after))) return
      if ([end, duration, until].filter(value => value !== undefined).length !== 1 || (until !== undefined && !validReferences(until))) return
      const definition = { name, section, id, input, tags, index: definitions.length }
      if (id) byId.set(id, definition)
      definitions.push(definition)
    }
  }
  if (!definitions.length) return
  const parseDate = ganttDateParser(dateFormat)
  const axisFormat = format || (/[Hh]|^X|^x/.test(dateFormat) ? '%H:%M' : '%b %d')
  const dayOf = (time: number) => Math.floor(time / dayMs) * dayMs
  const excludedDates = new Set<number>()
  const includedDates = new Set<number>()
  const excludedWeekdays = new Set<number>()
  for (const item of excludes) {
    const name = item.toLowerCase()
    if (name === 'weekends') {
      excludedWeekdays.add(weekend)
      excludedWeekdays.add((weekend + 1) % 7)
    }
    else if (weekdays.includes(name)) excludedWeekdays.add(weekdays.indexOf(name))
    else {
      const date = parseDate(item)
      if (date === undefined) return
      excludedDates.add(dayOf(date))
    }
  }
  for (const item of includes) {
    const date = parseDate(item)
    if (date === undefined) return
    includedDates.add(dayOf(date))
  }
  const isExcluded = (value: number) => {
    const day = dayOf(value)
    return !includedDates.has(day) && (excludedDates.has(day) || excludedWeekdays.has(new Date(day).getUTCDay()))
  }
  function applyDuration(start: number, target: number): number | undefined {
    if (target === start || (!excludedDates.size && !excludedWeekdays.size)) return target
    let remaining = target - start
    let cursor = start
    for (let days = 0; days < 20_000; days++) {
      const next = dayOf(cursor) + dayMs
      if (!isExcluded(cursor)) {
        const available = next - cursor
        if (remaining <= available) return cursor + remaining
        remaining -= available
      }
      cursor = next
    }
  }

  const values = new Map<string, number>()
  const calculating = new Set<string>()
  function resolve(task: TaskDefinition, endpoint: 'start' | 'end'): number | undefined {
    const key = `${task.index}:${endpoint}`
    if (values.has(key)) return values.get(key)
    if (calculating.has(key)) return
    calculating.add(key)
    const value = endpoint === 'start' ? start(task) : end(task)
    calculating.delete(key)
    if (value !== undefined && Number.isFinite(new Date(value).valueOf())) {
      values.set(key, value)
      return value
    }
  }
  function dependency(references: readonly string[], endpoint: 'start' | 'end'): number | undefined {
    const times = references.map((id) => {
      const task = byId.get(id)
      return task ? resolve(task, endpoint) : undefined
    })
    if (times.some(time => time === undefined)) return
    return endpoint === 'end' ? Math.max(...times as number[]) : Math.min(...times as number[])
  }
  function start(task: TaskDefinition): number | undefined {
    if (task.input.after) return dependency(task.input.after, 'end')
    if (task.input.start !== undefined) return parseDate(task.input.start)
    const previous = definitions[task.index - 1]
    return previous ? resolve(previous, 'end') : dayOf(now)
  }
  function end(task: TaskDefinition): number | undefined {
    if (task.input.until) return dependency(task.input.until, 'start')
    if (task.input.end !== undefined) {
      const explicit = parseDate(task.input.end)
      return explicit === undefined ? undefined : explicit + (inclusiveEndDates ? dayMs : 0)
    }
    const start = resolve(task, 'start')
    if (start === undefined || task.input.duration === undefined) return
    const target = durationEnd(start, task.input.duration)
    if (target !== undefined) return applyDuration(start, target)
  }
  const tasks: ScheduledGanttTask[] = []
  for (const task of definitions) {
    const start = resolve(task, 'start')
    const end = resolve(task, 'end')
    if (start === undefined || end === undefined || end < start) return
    tasks.push({ ...task, start, end })
  }
  return { tasks, sections, title, axisFormat, ticks, topAxis, todayMarker, isExcluded }
}

function validReferences(values: readonly string[]): boolean {
  return Array.isArray(values) && values.length > 0 && values.every(id => typeof id === 'string' && /^[\w.-]+$/.test(id))
}

function todayStyle(style: GanttMarkerStyle | undefined): string {
  const stroke = safeColor(style?.stroke)
  const thickness = boundedNumber(style?.strokeWidth, 0, 64)
  const opacity = boundedNumber(style?.opacity, 0, 1)
  const rules = [stroke && `stroke:${stroke}`, thickness !== undefined && `stroke-width:${thickness}px`, opacity !== undefined && `opacity:${opacity}`]
    .filter(Boolean).join(';')
  return rules ? ` style="${rules}"` : ''
}

function taskLink(value: unknown): string | undefined {
  if (typeof value !== 'string') return
  const href = value.trim()
  if (!href || href.length > 2048 || /[\0-\x1f\x7f\\]/.test(href)) return
  const url = URL.parse(href, 'https://ts-charts.invalid')
  if (url?.protocol === 'https:' || url?.protocol === 'http:') return href
}

function callbackAttributes(callback: GanttTaskCallback | undefined, id: string): string {
  const name = callback?.name
  if (typeof name !== 'string' || name.length > 120) return ''
  if (name.split('.').some(part => !/^[a-z_$][\w$]*$/i.test(part) || ['constructor', 'prototype', '__proto__'].includes(part))) return ''
  const args = callback?.args ?? []
  if (!Array.isArray(args) || args.length > 32 || args.some(value => typeof value !== 'string' || value.length > 1024)) return ''
  return ` data-gantt-callback="${escapeHtml(name)}" data-gantt-args="${escapeHtml(JSON.stringify(args.length ? args : [id]))}"`
}

export function ganttChart(chart: GanttChartOptions): string | undefined {
  const now = chart.now ?? Date.now()
  const schedule = scheduleGantt({ ...chart, now })
  if (!schedule) return
  const { tasks, sections, title, axisFormat, ticks, isExcluded } = schedule
  const compact = chart.displayMode === 'compact'
  const visibleTasks = tasks.filter(task => !task.tags.includes('vert'))
  const fontSize = boundedNumber(chart.fontSize, 6, 96)
  const sectionFontSize = boundedNumber(chart.sectionFontSize, 6, 96)
  const letterWidth = (fontSize ?? 14) / 2
  const labelWidth = compact ? 140 : Math.max(132, Math.min(288, Math.max(0, ...visibleTasks.map(task => task.name.length * letterWidth)) + 28))
  const x0 = boundedNumber(chart.leftPadding, 20, 2000) ?? labelWidth
  const rightPadding = boundedNumber(chart.rightPadding, 0, 2000) ?? 30
  const width = Math.max(x0 + rightPadding + 48, boundedNumber(chart.width, 1, 10000) ?? x0 + 710 + rightPadding)
  const plotWidth = width - x0 - rightPadding
  const titleY = titlePosition(chart.titleTopMargin)
  const top = Math.max(title ? titleY + 14 : 0, boundedNumber(chart.topPadding, 0, 2000) ?? (title ? 55 : 23))
  const barHeight = boundedNumber(chart.barHeight, 1, 200) ?? 16
  const rowHeight = Math.max((fontSize ?? 0) + 4, barHeight + (boundedNumber(chart.barGap, 0, 200) ?? 18))
  const sectionHeight = (sectionFontSize ?? 14) + 14
  const sectionStyles = Math.floor(boundedNumber(chart.numberSectionStyles, 1, 12) ?? (Math.min(chart.sectionColors?.length ?? 0, 12) || 1))
  const start = Math.min(...tasks.map(task => task.start))
  const latest = Math.max(...tasks.map(task => task.end))
  const end = latest > start ? latest + Math.max(1, (latest - start) / 12) : start + dayMs
  if (!Number.isFinite(new Date(end).valueOf())) return
  const xAt = (time: number) => x0 + 12 + (time - start) / (end - start) * (plotWidth - 24)
  const taskY = new Map<ScheduledGanttTask, number>()
  const groups: string[] = []
  let y = top + (schedule.topAxis ? 20 : 0)
  for (const [index, section] of sections.entries()) {
    const children = visibleTasks.filter(task => task.section === index)
    if (!children.length) continue
    const sectionTop = y
    if (section) y += sectionHeight
    // Only reuse a lane after the previous bar (or milestone) has cleared it.
    const lanes: number[] = []
    const ordered = compact ? [...children].sort((a, b) => a.start - b.start) : children
    for (const [row, task] of ordered.entries()) {
      let lane = compact ? lanes.findIndex(last => last < task.start) : row
      if (lane === -1) lane = lanes.length
      lanes[lane] = task.end
      taskY.set(task, y + (lane + 0.5) * rowHeight)
    }
    y += lanes.length * rowHeight
    const slot = groups.length % sectionStyles
    const sectionColor = safeColor(chart.sectionColors?.[slot]) ?? (sectionStyles > 1 ? chronologyColor(slot) : undefined)
    const styledFill = sectionColor ? ` style="fill:${sectionColor};opacity:0.2"` : ''
    const heading = section ? svgText(section, 20, sectionTop + sectionHeight / 2, 'diagram-gantt-section-label', 'start', { fontSize: sectionFontSize }) : ''
    groups.push(`<g class="diagram-gantt-section"><rect class="diagram-gantt-band" fill="#869eb6" fill-opacity="${sectionColor ? 1 : 0.1}"${styledFill} x="9" y="${sectionTop}" width="${width - 18}" height="${y - sectionTop}" rx="4"/>${heading}</g>`)
    y += 6
  }
  const bottom = Math.max(top + 33, y)
  const gridStart = boundedNumber(chart.gridLineStartPadding, 0, bottom - 1) ?? top
  const bands: string[] = []
  // At extremely broad date ranges individual exclusion days are too narrow to show.
  if ((end - start) / dayMs <= 180) {
    for (let day = Math.floor(start / dayMs) * dayMs; day < end; day += dayMs) {
      if (!isExcluded(day)) continue
      const left = xAt(Math.max(start, day))
      const right = xAt(Math.min(end, day + dayMs))
      bands.push(`<rect class="diagram-gantt-excluded" fill="#869eb6" fill-opacity="0.15" x="${left}" y="${gridStart}" width="${right - left}" height="${bottom - gridStart}"/>`)
    }
  }
  const grid = ganttTicks(start, end, ticks, chart.weekday).map((time) => {
    const x = xAt(time)
    const label = ganttAxisDate(time, axisFormat)
    return `<path class="diagram-gantt-grid" stroke="currentColor" stroke-opacity="0.25" fill="none" d="M${x} ${gridStart}V${bottom}"/>${svgText(label, x, bottom + 13, 'diagram-gantt-tick')}${schedule.topAxis ? svgText(label, x, top + 8, 'diagram-gantt-tick') : ''}`
  })
  let interactive = false
  function withInteraction(task: ScheduledGanttTask, content: string): string {
    const href = taskLink(task.input.href)
    const callback = callbackAttributes(task.input.callback, task.id)
    if (!href && !callback) return content
    interactive = true
    const label = ` aria-label="${escapeHtml(task.name)}"`
    return href
      ? `<a class="diagram-gantt-link" href="${escapeHtml(href)}" target="_self"${label}${callback}>${content}</a>`
      : `<g class="diagram-gantt-action" role="button" tabindex="0"${label}${callback}>${content}</g>`
  }
  const markers = tasks.filter(task => task.tags.includes('vert')).map(task => {
    const x = xAt(task.start + (task.end - task.start) / 2)
    return withInteraction(task, `<path class="diagram-gantt-reference" stroke="#548ba9" fill="none" d="M${x} ${top}V${bottom}"><title>${escapeHtml(task.name)}</title></path>`)
  })
  if (schedule.todayMarker && now >= start && now <= end) {
    const x = xAt(now)
    markers.push(`<path class="diagram-gantt-today" stroke="#d66550" fill="none"${todayStyle(chart.todayMarkerStyle)} d="M${x} ${top}V${bottom}"><title>Today</title></path>`)
  }
  const bars = visibleTasks.map((task) => {
    const center = taskY.get(task)!
    const left = xAt(task.start)
    const right = xAt(task.end)
    const date = (stamp: number) => new Date(stamp).toISOString()
    const kind = task.tags.map(tag => `diagram-gantt-${tag}`).join(' ')
    const middle = (left + right) / 2
    const fill = task.tags.includes('crit') ? '#db8c95' : task.tags.includes('done') ? '#83bb9f' : task.tags.includes('active') ? '#e7bb71' : '#85b7dd'
    const half = barHeight / 2
    const shape = task.tags.includes('milestone')
      ? `<path class="diagram-gantt-milestone-shape" fill="${fill}" d="M${middle} ${center - half}L${middle + half} ${center}L${middle} ${center + half}L${middle - half} ${center}Z"/>`
      : `<rect class="diagram-gantt-bar" fill="${fill}" x="${left}" y="${center - half}" width="${Math.max(2, right - left)}" height="${barHeight}" rx="4"/>`
    const max = compact ? Math.max(1, Math.floor((width - right - 18) / letterWidth)) : Math.max(1, Math.floor((x0 - 22) / letterWidth))
    const name = task.name.length > max ? `${task.name.slice(0, max - 1)}…` : task.name
    const content = `<g class="diagram-gantt-task${kind ? ` ${kind}` : ''}" data-task-id="${escapeHtml(task.id)}" data-task-start="${date(task.start)}" data-task-end="${date(task.end)}"><title>${escapeHtml(task.name)} (${date(task.start)} to ${date(task.end)})</title>${shape}${svgText(name, compact ? right + 13 : 20, center, 'diagram-gantt-label', 'start', { fontSize })}</g>`
    return withInteraction(task, content)
  })
  const body = `<g data-diagram-kind="gantt">${groups.join('')}${bands.join('')}${grid.join('')}${markers.join('')}${bars.join('')}</g>`
  const svg = chronologySvg(chart, chartPrefix(chart.idPrefix), 'Gantt chart', width, bottom + 31 + (boundedNumber(chart.bottomMarginAdj, 0, 2000) ?? 0), body, titleY)
  return interactive ? svg.replace('role="img"', 'role="group"') : svg
}
