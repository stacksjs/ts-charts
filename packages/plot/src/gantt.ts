import type { ChartLabels } from './chronology.ts'
import { color } from '../../color/src/color.ts'
import { utcFormat } from '../../time-format/src/defaultLocale.ts'
import { boundedNumber, chartPrefix, chronologyColor, chronologyInk, chronologySvg, safeColor, titlePosition } from './chronology.ts'
import { escapeHtml, labelLines, svgText, svgTextLines } from './diagram-svg.ts'
import { layoutAxisLabels, layoutTaskLabel } from './gantt-labels.ts'
import { dayMs, defaultGanttAxisFormat, durationEnd, ganttDateFormatter, ganttDateParser, ganttIsoStart, ganttTicks, weekdays } from './gantt-time.ts'

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
export interface GanttMarkerStyle {
  stroke?: string
  strokeWidth?: number
  opacity?: number
  strokeOpacity?: number
  strokeDasharray?: readonly number[] | 'none'
  strokeDashoffset?: number
  strokeLinecap?: 'butt' | 'round' | 'square'
}
export interface GanttTaskPaint { fill?: string, border?: string }
export interface GanttPalette {
  background?: string
  task?: GanttTaskPaint
  active?: GanttTaskPaint
  done?: GanttTaskPaint
  critical?: GanttTaskPaint
  insideText?: string
  statusText?: string
  outsideText?: string
  clickableText?: string
  title?: string
  sectionText?: string
  axisText?: string
  grid?: string
  excluded?: string
  reference?: string
}
export interface GanttChartOptions extends ChartLabels {
  sections: readonly GanttSection[]
  dateFormat?: string
  /** Accept valid ISO dates and timestamps when a task start does not match dateFormat. */
  startDateFallback?: 'iso'
  axisFormat?: string
  tickInterval?: string
  excludes?: readonly string[]
  includes?: readonly string[]
  /** Match custom inclusion and exclusion entries against the full formatted timestamp. */
  calendarMatch?: 'formatted'
  /** Coalesce consecutive excluded days within the scheduled date range. */
  exclusionBands?: 'ranges'
  /** Shift adjustable endpoints by whole excluded dates, preserving gaps between tasks. */
  exclusionMode?: 'working-time' | 'whole-days'
  /** When set, only end dates matching this format stay fixed through exclusions. Other explicit dates and until targets can move. */
  fixedEndDateFormat?: string
  /** Calendar mode rounds fractional days and weeks to whole days and uses whole months or years. */
  durationMode?: 'elapsed' | 'calendar'
  /** Skip unknown IDs and use the reference day when none of the IDs exist. */
  missingDependencyFallback?: 'today'
  weekend?: 'friday' | 'saturday'
  weekday?: GanttWeekday
  topAxis?: boolean
  todayMarker?: boolean
  todayMarkerStyle?: GanttMarkerStyle
  inclusiveEndDates?: boolean
  displayMode?: 'compact'
  /** Position labels inside or beside their bars in the standard layout. */
  taskLabelPlacement?: 'bar' | 'gutter'
  /** Wrap full task labels and reserve room for them in compact rows. */
  wrapTaskLabels?: boolean
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
  palette?: GanttPalette
  /** UTC timestamp used by the today marker, partial dates, and the first undated task. */
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
  /** The endpoint used by scheduling dependencies. */
  end: number
  /** The visible bar ends here when a run of excluded days delays the next task. */
  barEnd?: number
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
      const previous = id ? byId.get(id) : undefined
      if (id && (!/^[\w.-]+$/.test(id) || (previous && !(tags.includes('vert') && previous.tags.includes('vert'))))) return
      if ((start !== undefined && after !== undefined) || (after !== undefined && !validReferences(after))) return
      if ([end, duration, until].filter(value => value !== undefined).length !== 1 || (until !== undefined && !validReferences(until))) return
      const definition = { name, section, id, input, tags, index: definitions.length }
      if (id) byId.set(id, definition)
      definitions.push(definition)
    }
  }
  if (!definitions.length) return
  const parseDate = ganttDateParser(dateFormat, now)
  const parseFixedEnd = chart.fixedEndDateFormat === undefined ? undefined : ganttDateParser(chart.fixedEndDateFormat, now)
  const dayOf = (time: number) => Math.floor(time / dayMs) * dayMs
  const today = dayOf(now)
  const isoDate = dateFormat === 'YYYY-MM-DD' ? parseDate : ganttDateParser('YYYY-MM-DD', now)
  const formattedCalendar = chart.calendarMatch === 'formatted'
  const calendarFormatter = formattedCalendar && dateFormat !== 'YYYY-MM-DD' ? ganttDateFormatter(dateFormat) : undefined
  let hasFormattedDates = false
  function calendarKey(value: string): number | string | undefined {
    const iso = isoDate(value)
    if (iso !== undefined) return iso
    if (formattedCalendar) {
      if (!calendarFormatter?.matches(value)) return
      hasFormattedDates = true
      return value.toLowerCase()
    }
    const date = parseDate(value)
    if (date !== undefined) return dayOf(date)
  }
  const excludedDates = new Set<number | string>()
  const includedDates = new Set<number | string>()
  const excludedWeekdays = new Set<number>()
  for (const item of excludes) {
    const name = item.toLowerCase()
    if (name === 'weekends') {
      excludedWeekdays.add(weekend)
      excludedWeekdays.add((weekend + 1) % 7)
    }
    else if (weekdays.includes(name)) excludedWeekdays.add(weekdays.indexOf(name))
    else {
      const key = calendarKey(item)
      if (key !== undefined) excludedDates.add(key)
      else if (!formattedCalendar) return
    }
  }
  for (const item of includes) {
    const key = calendarKey(item)
    if (key !== undefined) includedDates.add(key)
    else if (!formattedCalendar) return
  }
  const isExcluded = (value: number) => {
    const day = dayOf(value)
    const formatted = hasFormattedDates && calendarFormatter ? calendarFormatter.format(value).toLowerCase() : ''
    if (includedDates.has(day) || includedDates.has(formatted)) return false
    const weekday = ((day / dayMs + 4) % 7 + 7) % 7
    return excludedDates.has(day) || excludedDates.has(formatted) || excludedWeekdays.has(weekday)
  }
  const hasExclusions = excludedDates.size > 0 || excludedWeekdays.size > 0
  function applyDuration(start: number, target: number): number | undefined {
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

  // Count excluded dates at the task's time of day. Keep trailing exclusions
  // out of the visible bar while advancing the dependency endpoint past them.
  function shiftByExcludedDays(start: number, target: number): { end: number, barEnd: number } | undefined {
    let end = target
    let barEnd = target
    let previousExcluded = false
    for (let date = start + dayMs, days = 0; date <= end; date += dayMs, days++) {
      if (days >= 20_000) return
      if (!previousExcluded) barEnd = end
      previousExcluded = isExcluded(date)
      if (previousExcluded) end += dayMs
    }
    return { end, barEnd }
  }

  const values = new Map<string, number>()
  const barEnds = new Map<number, number>()
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
  function dependency(owner: TaskDefinition, references: readonly string[], endpoint: 'start' | 'end'): number | undefined {
    let result: number | undefined
    for (const id of references) {
      const task = byId.get(id)
      if (!task && chart.missingDependencyFallback === 'today') continue
      const time = task && resolve(task, endpoint)
      if (time === undefined) return
      result = result === undefined ? time : endpoint === 'end' ? Math.max(result, time) : Math.min(result, time)
    }
    if (result !== undefined || endpoint === 'end') return result ?? today
    // When an unknown until target falls before the task, keep a zero-length
    // interval so tasks depending on its end use the same value as the chart.
    const start = resolve(owner, 'start')
    return start === undefined ? undefined : Math.max(today, start)
  }
  function start(task: TaskDefinition): number | undefined {
    if (task.input.after) return dependency(task, task.input.after, 'end')
    if (task.input.start !== undefined)
      return parseDate(task.input.start) ?? (chart.startDateFallback === 'iso' ? ganttIsoStart(task.input.start.trim()) : undefined)
    const previous = definitions[task.index - 1]
    return previous ? resolve(previous, 'end') : today
  }
  function targetEnd(task: TaskDefinition, start: number): number | undefined {
    if (task.input.until) return dependency(task, task.input.until, 'start')
    if (task.input.end !== undefined) {
      const explicit = parseDate(task.input.end)
      return explicit === undefined ? undefined : explicit + (inclusiveEndDates ? dayMs : 0)
    }
    if (task.input.duration !== undefined) return durationEnd(start, task.input.duration, chart.durationMode)
  }
  function end(task: TaskDefinition): number | undefined {
    const start = resolve(task, 'start')
    if (start === undefined) return
    const target = targetEnd(task, start)
    if (target === undefined || !hasExclusions || target <= start) return target
    const fixed = parseFixedEnd
      ? task.input.end !== undefined && parseFixedEnd(task.input.end) !== undefined
      : task.input.end !== undefined || task.input.until !== undefined
    if (fixed) return target
    if (chart.exclusionMode !== 'whole-days') return applyDuration(start, target)
    const adjusted = shiftByExcludedDays(start, target)
    if (adjusted && adjusted.barEnd !== adjusted.end && !task.tags.includes('milestone')) {
      barEnds.set(task.index, adjusted.barEnd)
    }
    return adjusted?.end
  }
  const tasks: ScheduledGanttTask[] = []
  for (const task of definitions) {
    const start = resolve(task, 'start')
    const end = resolve(task, 'end')
    const barEnd = barEnds.get(task.index)
    if (start === undefined || end === undefined || end < start) return
    tasks.push({ ...task, start, end, ...(barEnd === undefined ? {} : { barEnd }) })
  }
  const crossesDay = dayOf(Math.min(...tasks.map(task => task.start))) !== dayOf(Math.max(...tasks.map(task => task.end)))
  const axisFormat = format || defaultGanttAxisFormat(dateFormat, crossesDay)
  return { tasks, sections, title, axisFormat, ticks, topAxis, todayMarker, isExcluded }
}

function validReferences(values: readonly string[]): boolean {
  return Array.isArray(values) && values.length > 0 && values.every(id => typeof id === 'string' && /^[\w.-]+$/.test(id))
}

function todayStyle(style: GanttMarkerStyle | undefined): string {
  if (!style) return ''
  const { stroke: paint, strokeDasharray, strokeLinecap } = style
  const stroke = safeColor(paint) ?? (typeof paint === 'string' && paint.length <= 120 ? color(paint)?.formatRgb() : undefined)
  const thickness = boundedNumber(style.strokeWidth, 0, 64)
  const opacity = boundedNumber(style.opacity, 0, 1)
  const strokeOpacity = boundedNumber(style.strokeOpacity, 0, 1)
  const offset = boundedNumber(style.strokeDashoffset, -10000, 10000)
  const rules: string[] = []
  if (stroke) rules.push(`stroke:${stroke}`)
  if (thickness !== undefined) rules.push(`stroke-width:${thickness}px`)
  if (opacity !== undefined) rules.push(`opacity:${opacity}`)
  if (strokeOpacity !== undefined) rules.push(`stroke-opacity:${strokeOpacity}`)
  if (strokeDasharray === 'none') rules.push('stroke-dasharray:none')
  else if (Array.isArray(strokeDasharray) && strokeDasharray.length > 0 && strokeDasharray.length <= 32
    && strokeDasharray.every(value => boundedNumber(value, 0, 2000) !== undefined))
    rules.push(`stroke-dasharray:${strokeDasharray.join(' ')}`)
  if (offset !== undefined) rules.push(`stroke-dashoffset:${offset}`)
  if (strokeLinecap === 'butt' || strokeLinecap === 'round' || strokeLinecap === 'square') rules.push(`stroke-linecap:${strokeLinecap}`)
  return rules.length ? ` style="${rules.join(';')}"` : ''
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

function barLabel(left: number, right: number, width: number, textWidth: number, milestone: boolean) {
  const gap = 8
  const inside = right - left - gap * 2
  if (!milestone && textWidth <= inside)
    return { x: (left + right) / 2, anchor: 'middle', space: inside }
  const after = width - right - gap * 2
  const before = left - gap * 2
  if (textWidth <= after || after >= before)
    return { x: right + gap, anchor: 'start', space: after }
  return { x: left - gap, anchor: 'end', space: before }
}

export function ganttChart(chart: GanttChartOptions): string | undefined {
  const now = chart.now ?? Date.now()
  const schedule = scheduleGantt({ ...chart, now })
  if (!schedule) return
  const { tasks, sections, title, axisFormat, ticks, isExcluded } = schedule
  const compact = chart.displayMode === 'compact'
  const barLabels = !compact && chart.taskLabelPlacement === 'bar'
  const palette = chart.palette
  const visibleTasks = tasks.filter(task => !task.tags.includes('vert'))
  const tasksBySection: ScheduledGanttTask[][] = sections.map(() => [])
  for (const task of visibleTasks) tasksBySection[task.section].push(task)
  const fontSize = boundedNumber(chart.fontSize, 6, 96)
  const sectionFontSize = boundedNumber(chart.sectionFontSize, 6, 96)
  const letterWidth = (fontSize ?? 14) / 2
  const labelWidth = compact || barLabels ? 140 : Math.max(132, Math.min(288, Math.max(0, ...visibleTasks.map(task => task.name.length * letterWidth)) + 28))
  const x0 = boundedNumber(chart.leftPadding, 20, 2000) ?? labelWidth
  const rightPadding = boundedNumber(chart.rightPadding, 0, 2000) ?? 30
  const width = Math.max(x0 + rightPadding + 48, boundedNumber(chart.width, 1, 10000) ?? x0 + 710 + rightPadding)
  const plotWidth = width - x0 - rightPadding
  const titleY = titlePosition(chart.titleTopMargin)
  const top = Math.max(title ? titleY + 14 : 0, boundedNumber(chart.topPadding, 0, 2000) ?? (title ? 55 : 23))
  const barHeight = boundedNumber(chart.barHeight, 1, 200) ?? 16
  const rowHeight = Math.max((fontSize ?? 0) + 4, barHeight + (boundedNumber(chart.barGap, 0, 200) ?? 18))
  const sectionLineHeight = sectionFontSize === undefined ? 16 : sectionFontSize * 1.15
  const sectionStyles = Math.floor(boundedNumber(chart.numberSectionStyles, 1, 12) ?? (Math.min(chart.sectionColors?.length ?? 0, 12) || 1))
  const sectionSlots = new Map([...new Set(visibleTasks.map(task => sections[task.section]))]
    .map((name, index) => [name, index % sectionStyles]))
  const sectionSlot = (section: number) => sectionSlots.get(sections[section]) ?? 0
  const start = Math.min(...tasks.map(task => task.start))
  const latest = Math.max(...tasks.map(task => task.end))
  const end = latest > start ? latest + Math.max(1, (latest - start) / 12) : start + dayMs
  if (!Number.isFinite(new Date(end).valueOf())) return
  const xAt = (time: number) => x0 + 12 + (time - start) / (end - start) * (plotWidth - 24)
  const spans = new Map(chart.wrapTaskLabels ? visibleTasks.map((task) => {
    const start = xAt(task.start)
    const end = xAt(task.barEnd ?? task.end)
    const milestone = task.tags.includes('milestone')
    const middle = (start + end) / 2
    const left = milestone ? middle - barHeight / 2 : start
    const right = milestone ? middle + barHeight / 2 : Math.max(start + 2, end)
    return [task, { left, right, milestone }] as const
  }) : [])
  const labelPlans = new Map([...spans].map(([task, span]) => {
    const { left, right } = span
    const neighbors = { left: 0, right: width }
    if (compact) {
      for (const other of tasksBySection[task.section]) {
        if (other === task) continue
        const otherSpan = spans.get(other)!
        if (otherSpan.right <= left) neighbors.left = Math.max(neighbors.left, otherSpan.right)
        if (otherSpan.left >= right) neighbors.right = Math.min(neighbors.right, otherSpan.left)
      }
    }
    const label = layoutTaskLabel(task.name, span, { width, barHeight, fontSize }, neighbors)
    return [task, { label, left: Math.min(left, label.left), right: Math.max(right, label.right) }] as const
  }))
  const taskY = new Map<ScheduledGanttTask, number>()
  const nextInLane = new Map<ScheduledGanttTask, number>()
  const groups: string[] = []
  let y = top + (schedule.topAxis ? 20 : 0)
  for (const [index, section] of sections.entries()) {
    const children = tasksBySection[index]
    if (!children.length) continue
    const sectionTop = y
    const sectionHeight = (sectionFontSize ?? 14) + 14 + (labelLines(section).length - 1) * sectionLineHeight
    if (section) y += sectionHeight
    // A milestone occupies both sides of its date even if its duration is zero.
    const lanes: { task: ScheduledGanttTask, point: boolean, tasks: ScheduledGanttTask[], above: number, below: number }[] = []
    const ordered = compact ? [...children].sort((a, b) => (labelPlans.get(a)?.left ?? a.start) - (labelPlans.get(b)?.left ?? b.start)) : children
    for (const [row, task] of ordered.entries()) {
      const point = task.start === task.end || task.tags.includes('milestone')
      const plan = labelPlans.get(task)
      let lane = compact ? lanes.findIndex(({ task: prior, point: priorPoint }) => {
        if (plan) return labelPlans.get(prior)!.right <= plan.left
        const priorEnd = prior.barEnd ?? prior.end
        return priorEnd < task.start || (priorEnd === task.start && !priorPoint && !point)
      }) : row
      if (lane === -1) lane = lanes.length
      const previous = lanes[lane]
      if (previous && !plan) nextInLane.set(previous.task, task.start)
      const labelHalf = plan ? plan.label.height / 2 + 2 : 0
      const offset = plan?.label.offset ?? 0
      const above = Math.max(previous?.above ?? 0, rowHeight / 2, labelHalf - offset)
      const below = Math.max(previous?.below ?? 0, rowHeight / 2, labelHalf + offset)
      const laneTasks = previous?.tasks ?? []
      laneTasks.push(task)
      lanes[lane] = { task, point, tasks: laneTasks, above, below }
    }
    for (const lane of lanes) {
      for (const task of lane.tasks) taskY.set(task, y + lane.above)
      y += lane.above + lane.below
    }
    const slot = sectionSlot(index)
    const sectionColor = safeColor(chart.sectionColors?.[slot]) ?? (sectionStyles > 1 ? chronologyColor(slot) : undefined)
    const styledFill = sectionColor ? ` style="fill:${sectionColor};opacity:0.2"` : ''
    const heading = section ? svgText(section, 20, sectionTop + sectionHeight / 2, 'diagram-gantt-section-label', 'start', { fontSize: sectionFontSize, color: safeColor(palette?.sectionText) }) : ''
    groups.push(`<g class="diagram-gantt-section" data-gantt-style-index="${slot}"><rect class="diagram-gantt-band" fill="#869eb6" fill-opacity="${sectionColor ? 1 : 0.1}"${styledFill} x="9" y="${sectionTop}" width="${width - 18}" height="${y - sectionTop}" rx="4"/>${heading}</g>`)
    y += 6
  }
  const bottom = Math.max(top + 33, y)
  const topAxisLine = top + 19
  const gridStart = boundedNumber(chart.gridLineStartPadding, 0, bottom - 1) ?? (schedule.topAxis ? topAxisLine : top)
  const bands: string[] = []
  const excludedColor = safeColor(palette?.excluded)
  const excludedStyle = excludedColor ? ` style="fill:${excludedColor}"` : ''
  const combineExclusions = chart.exclusionBands === 'ranges'
  const exclusionCutoff = combineExclusions ? durationEnd(start, '6y', 'calendar') : undefined
  const showExclusions = combineExclusions
    ? !(exclusionCutoff !== undefined && latest >= exclusionCutoff)
    : (end - start) / dayMs <= 180
  if (showExclusions && chart.excludes?.length) {
    const firstDay = Math.floor(start / dayMs) * dayMs
    const timeOfDay = chart.calendarMatch === 'formatted' ? start - firstDay : 0
    const ranges: { start: number, end: number }[] = []
    for (let day = firstDay; combineExclusions ? day + timeOfDay <= latest : day < end; day += dayMs) {
      if (!isExcluded(day + timeOfDay)) continue
      const previous = ranges.at(-1)
      if (combineExclusions && previous?.end === day) previous.end += dayMs
      else ranges.push({ start: day, end: day + dayMs })
    }
    for (const range of ranges) {
      const left = xAt(Math.max(start, range.start))
      const right = xAt(Math.min(end, range.end))
      const dates = combineExclusions
        ? ` data-excluded-start="${new Date(range.start).toISOString().split('T')[0]}" data-excluded-end="${new Date(range.end).toISOString().split('T')[0]}"`
        : ''
      bands.push(`<rect class="diagram-gantt-excluded"${dates} fill="#869eb6" fill-opacity="0.15"${excludedStyle} x="${left}" y="${gridStart}" width="${right - left}" height="${bottom - gridStart}"/>`)
    }
  }
  const gridColor = safeColor(palette?.grid)
  const gridStyle = gridColor ? ` style="stroke:${gridColor}"` : ''
  const axisStyle = { color: safeColor(palette?.axisText) }
  const axisFontSize = 12
  const formatTick = utcFormat(axisFormat)
  const axisTicks = ganttTicks(start, end, ticks, chart.weekday).map(time => ({ x: xAt(time), text: formatTick(time) }))
  const axisLabels = layoutAxisLabels(axisTicks, width, axisFontSize)
  const axes = (schedule.topAxis ? ['bottom', 'top'] as const : ['bottom'] as const).map((position) => {
    const above = position === 'top'
    const y = above ? topAxisLine : bottom
    const y2 = above ? y - 4 : gridStart
    const domain = `<path class="diagram-gantt-axis-line" d="M${xAt(start)} ${y}H${xAt(end)}" stroke="currentColor" stroke-opacity="0.25" fill="none"${gridStyle}/>`
    const ticks = axisTicks.map(({ x, text }, index) => {
      const label = axisLabels.get(index)
      const caption = label ? svgTextLines([label.text], label.x, above ? top + 8 : bottom + 13, 'diagram-gantt-tick', 'middle', 'currentColor', axisStyle) : ''
      const line = `<line class="diagram-gantt-grid" x1="${x}" x2="${x}" y1="${y2}" y2="${y}" stroke="currentColor" stroke-opacity="0.25"${gridStyle}/>`
      return `<g class="diagram-gantt-tick-group"><title>${escapeHtml(text)}</title>${line}${caption}</g>`
    }).join('')
    return `<g class="diagram-gantt-axis" data-axis="${position}" font-size="${axisFontSize}">${domain}${ticks}</g>`
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
  const reference = safeColor(palette?.reference)
  const referenceStyle = reference ? ` style="stroke:${reference}"` : ''
  const referenceLanes: number[] = []
  const referenceFont = Math.min(fontSize ?? 14, 24)
  const referenceLineHeight = referenceFont + 5
  const referenceKeys = new Set<string>()
  const taskClasses = (task: ScheduledGanttTask) => task.tags.map(tag => ` diagram-gantt-${tag}`).join('')
  const markers = tasks.filter(task => {
    if (!task.tags.includes('vert')) return false
    if (!task.id) return true
    const key = JSON.stringify([task.id, task.start, task.name])
    if (referenceKeys.has(key)) return false
    referenceKeys.add(key)
    return true
  }).sort((a, b) => a.start - b.start).map(task => {
    const x = xAt(task.start)
    const label = Array.from(task.name.replace(/<br\s*\/?>/gi, ' '))
    const limit = Math.floor((width - 20) / (referenceFont * 0.6))
    const text = label.length > limit ? label.slice(0, limit - 1).join('') + '…' : label.join('')
    const halfWidth = Math.min(width / 2 - 10, (Math.min(limit, label.length) * referenceFont * 0.6 + 10) / 2)
    const center = Math.min(width - halfWidth - 5, Math.max(halfWidth + 5, x))
    let lane = referenceLanes.findIndex(edge => edge <= center - halfWidth)
    if (lane === -1) lane = referenceLanes.length
    referenceLanes[lane] = center + halfWidth
    const caption = svgText(text, center, bottom + 31 + lane * referenceLineHeight, 'diagram-gantt-reference-label', 'middle', { fontSize: referenceFont, color: reference })
    return withInteraction(task, `<g class="diagram-gantt-marker${taskClasses(task)}" data-task-id="${escapeHtml(task.id)}" data-task-start="${new Date(task.start).toISOString()}" data-gantt-style-index="${sectionSlot(task.section)}"><path class="diagram-gantt-reference" stroke="#548ba9" fill="none"${referenceStyle} d="M${x} ${top}V${bottom}"><title>${escapeHtml(task.name)}</title></path>${caption}</g>`)
  })
  if (schedule.todayMarker && now >= start && now <= end) {
    const x = xAt(now)
    markers.push(`<path class="diagram-gantt-today" stroke="#d66550" fill="none"${todayStyle(chart.todayMarkerStyle)} d="M${x} ${top}V${bottom}"><title>Today</title></path>`)
  }
  const bars = visibleTasks.map((task) => {
    const center = taskY.get(task)!
    const left = xAt(task.start)
    const barEnd = task.barEnd ?? task.end
    const right = xAt(barEnd)
    const date = (stamp: number) => new Date(stamp).toISOString()
    const middle = (left + right) / 2
    const critical = task.tags.includes('crit')
    const active = task.tags.includes('active')
    const done = task.tags.includes('done')
    const paint = active ? palette?.active : done ? palette?.done : critical ? palette?.critical : palette?.task
    const themedFill = safeColor(paint?.fill)
    const border = safeColor(critical ? palette?.critical?.border ?? paint?.border : paint?.border)
    const fill = critical ? '#db8c95' : done ? '#83bb9f' : active ? '#e7bb71' : '#85b7dd'
    const rules = [themedFill && `fill:${themedFill}`, border && `stroke:${border};stroke-width:2px`].filter(Boolean).join(';')
    const style = rules ? ` style="${rules}"` : ''
    const half = barHeight / 2
    const milestone = task.tags.includes('milestone')
    const shape = milestone
      ? `<path class="diagram-gantt-milestone-shape" fill="${fill}"${style} d="M${middle} ${center - half}L${middle + half} ${center}L${middle} ${center + half}L${middle - half} ${center}Z"/>`
      : `<rect class="diagram-gantt-bar" fill="${fill}"${style} x="${left}" y="${center - half}" width="${Math.max(2, right - left)}" height="${barHeight}" rx="4"/>`
    const next = nextInLane.get(task)
    const inside = right - left - 12
    const after = (next === undefined ? width - 5 : xAt(next) - 5) - right - 13
    const centerLabel = compact && !milestone && inside > 0 && (inside >= task.name.length * letterWidth || inside >= after)
    const available = !compact ? x0 - 22 : centerLabel ? inside : after
    const capacity = Math.max(compact ? 0 : 1, Math.floor(available / letterWidth))
    const clickableColor = task.input.href || task.input.callback ? safeColor(palette?.clickableText) : undefined
    let label = ''
    const plan = labelPlans.get(task)?.label
    if (plan) {
      const inside = plan.anchor === 'middle' && plan.offset === 0
      const insideText = active || done ? palette?.statusText ?? palette?.insideText : palette?.insideText
      const color = inside ? safeColor(insideText) ?? chronologyInk : safeColor(palette?.outsideText)
      label = svgTextLines(plan.lines, plan.x, center + plan.offset, 'diagram-gantt-label', plan.anchor, 'currentColor', {
        fontSize, color: clickableColor ?? color,
      })
    }
    else if (barLabels) {
      const lines = labelLines(task.name).map(line => Array.from(line))
      const glyphWidth = (fontSize ?? 14) * 0.6
      const longest = Math.max(...lines.map(line => line.length))
      const placement = barLabel(milestone ? middle - half : left, milestone ? middle + half : right, width, longest * glyphWidth, milestone)
      const limit = Math.floor(placement.space / glyphWidth)
      if (limit > 0) {
        const fitted = lines.map(line => line.length > limit ? `${line.slice(0, limit - 1).join('')}…` : line.join(''))
        const insideText = active || done ? palette?.statusText ?? palette?.insideText : palette?.insideText
        const themedText = placement.anchor === 'middle' ? safeColor(insideText) ?? chronologyInk : safeColor(palette?.outsideText)
        label = svgTextLines(fitted, placement.x, center, 'diagram-gantt-label', placement.anchor, 'currentColor',
          { fontSize, color: clickableColor ?? themedText })
      }
    }
    else if (capacity) {
      const name = task.name.length > capacity ? `${task.name.slice(0, capacity - 1)}…` : task.name
      const x = !compact ? 20 : centerLabel ? middle : right + 13
      const textColor = centerLabel ? (active || done ? palette?.statusText ?? palette?.insideText : palette?.insideText) : palette?.outsideText
      label = svgText(name, x, center, 'diagram-gantt-label', centerLabel ? 'middle' : 'start',
        { fontSize, color: clickableColor ?? safeColor(textColor) ?? (centerLabel ? chronologyInk : undefined) })
    }
    const barEndpoint = task.barEnd === undefined ? '' : ` data-task-bar-end="${date(barEnd)}"`
    const content = `<g class="diagram-gantt-task${taskClasses(task)}" data-task-id="${escapeHtml(task.id)}" data-task-start="${date(task.start)}" data-task-end="${date(task.end)}"${barEndpoint} data-gantt-style-index="${sectionSlot(task.section)}"><title>${escapeHtml(task.name)} (${date(task.start)} to ${date(barEnd)})</title>${shape}${label}</g>`
    return withInteraction(task, content)
  })
  const body = `<g data-diagram-kind="gantt">${groups.join('')}${bands.join('')}${axes.join('')}${markers.join('')}${bars.join('')}</g>`
  const height = bottom + 31 + referenceLanes.length * referenceLineHeight + (boundedNumber(chart.bottomMarginAdj, 0, 2000) ?? 0)
  const svg = chronologySvg(chart, chartPrefix(chart.idPrefix), 'Gantt chart', width, height, body, titleY,
    { titleColor: palette?.title, background: palette?.background })
  return interactive ? svg.replace('role="img"', 'role="group"') : svg
}
