import { expect, spyOn, test } from 'bun:test'
import type { GanttChartOptions, GitGraphOptions } from '../src/diagrams.ts'
import { buildGitHistory, flowchartDiagram, ganttChart, ganttDateParser, gitGraphChart, journeyChart, pieChart, relationshipChart, scheduleGantt, sequenceChart, timelineChart } from '../src/diagrams.ts'

test('uses the local Gantt calendar for durations, deadlines, exclusions, and axis labels', async () => {
  const entry = new URL('../src/diagrams.ts', import.meta.url).pathname
  const source = `
    import { ganttChart, ganttDateParser, scheduleGantt } from ${JSON.stringify(entry)}
    const chart = {
      timeZone: 'local', inclusiveEndDates: true, tickInterval: '1day', axisFormat: '%m/%d %H:%M',
      sections: [{ tasks: [
        { name: 'Fall overlap', start: '2020-11-01', duration: '1d' },
        { name: 'Fixed deadline', start: '2020-11-01', end: '2020-11-01' },
        { name: 'Spring gap', start: '2020-03-08', duration: '1d' },
      ] }],
    }
    const weekend = {
      ...chart, excludes: ['weekends'], exclusionMode: 'whole-days', exclusionBands: 'ranges',
      sections: [{ tasks: [
        { name: 'Draft', id: 'draft', start: '2020-10-30', duration: '1d' },
        { name: 'Review', after: ['draft'], duration: '1d' },
      ] }],
    }
    const dates = options => scheduleGantt(options).tasks.map(({ start, end, barEnd }) =>
      [start, end, barEnd].map(value => value === undefined ? null : new Date(value).toISOString()))
    const parse = ganttDateParser('YYYY-MM-DD HH:mm', 0, 'local')
    const withOffset = ganttDateParser('YYYY-MM-DD HH:mmZ', 0, 'local')
    console.log(JSON.stringify({
      local: dates(chart), weekend: dates(weekend), svg: ganttChart(weekend),
      gap: parse('2020-03-08 02:30') ?? null,
      offset: new Date(withOffset('2020-11-01 10:00+09:00')).toISOString(),
    }))
  `
  const child = Bun.spawn([process.execPath, '-e', source], {
    env: { ...process.env, TZ: 'America/Los_Angeles' }, stdout: 'pipe', stderr: 'pipe',
  })
  const [status, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
  if (status) throw new Error(stderr)
  const output = JSON.parse(stdout)
  expect(output.local).toEqual([
    ['2020-11-01T07:00:00.000Z', '2020-11-02T08:00:00.000Z', null],
    ['2020-11-01T07:00:00.000Z', '2020-11-02T08:00:00.000Z', null],
    ['2020-03-08T08:00:00.000Z', '2020-03-09T07:00:00.000Z', null],
  ])
  expect(output.weekend).toEqual([
    ['2020-10-30T07:00:00.000Z', '2020-11-02T08:00:00.000Z', '2020-10-31T07:00:00.000Z'],
    ['2020-11-02T08:00:00.000Z', '2020-11-03T08:00:00.000Z', null],
  ])
  expect(output.svg).toContain('data-excluded-start="2020-10-31" data-excluded-end="2020-11-02"')
  expect(output.svg).toContain('<title>11/02 00:00</title>')
  expect(output.svg).not.toContain('11/02 08:00')
  expect(output.gap).toBeNull()
  expect(output.offset).toBe('2020-11-01T01:00:00.000Z')
})

test('renders a Gantt axis before any tasks have been declared', () => {
  const chart = { sections: [], now: Date.UTC(2026, 3, 6), topAxis: true, todayMarker: false }
  expect(scheduleGantt(chart)?.tasks).toEqual([])
  const svg = ganttChart(chart)
  expect(svg).toContain('data-axis="top"')
  expect(svg).toContain('>2026-04-06</tspan>')
  expect(svg).not.toMatch(/data-task-id=|Infinity|NaN/)
})
import { ganttTicks } from '../src/gantt-time.ts'
import { quadrantChart } from '../src/quadrant.ts'

test('anchors Gantt ticks to the calendar field and keeps crowded axes bounded', () => {
  expect(ganttTicks(Date.UTC(2026, 1, 15), Date.UTC(2026, 10, 1), '3month')).toEqual([
    Date.UTC(2026, 3, 1), Date.UTC(2026, 6, 1), Date.UTC(2026, 9, 1),
  ])
  expect(ganttTicks(Date.UTC(2026, 2, 6, 7, 55), Date.UTC(2026, 2, 6, 8, 15), '7minute')).toEqual([
    Date.UTC(2026, 2, 6, 7, 56), Date.UTC(2026, 2, 6, 8, 0), Date.UTC(2026, 2, 6, 8, 7), Date.UTC(2026, 2, 6, 8, 14),
  ])
  const start = Date.UTC(2018, 1, 1)
  const end = Date.UTC(2026, 9, 1)
  const wide = ganttTicks(start, end, '1month')
  expect(wide).toEqual(ganttTicks(start, end, ''))
  expect(wide.length).toBeLessThan(60)
  expect(wide.at(-1)).toBeGreaterThan(Date.UTC(2025, 11, 31))
})

test('preserves dense explicit Gantt ticks up to the configured limit', () => {
  const start = Date.UTC(2026, 0, 1)
  const end = start + 9999
  const ms = (last: number, limit: number) => ganttTicks(start, last, '1millisecond', 'sunday', 'UTC', limit)
  expect(ms(end, 10_000)).toHaveLength(10_000)
  expect(ms(end, 10_000).at(-1)).toBe(end)
  const pastLimit = end + 1
  expect(ms(pastLimit, 100_000)).toEqual(ganttTicks(start, pastLimit, ''))
  expect(ms(end, 60)).toEqual(ganttTicks(start, end, ''))
})

test('lays out a standalone SVG flowchart with decisions, branch labels, and loops', () => {
  const svg = flowchartDiagram({
    title: 'Publish or revise',
    idPrefix: 'approval',
    direction: 'right',
    nodes: [{ id: 'check', label: 'Ready?', shape: 'diamond' }, { id: 'publish' }, { id: 'revise' }],
    edges: [{ from: 'check', to: 'check', label: 'Retry' }, { from: 'check', to: 'publish', label: 'Yes' }, { from: 'check', to: 'revise', label: 'No' }],
  })!
  expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
  expect(svg).toContain('<polygon fill="#e5edf6"')
  expect(svg.match(/marker-end="url\(#approval\)"/g)).toHaveLength(3)
  expect(svg).toContain('>Retry</tspan>')
  expect(svg).toContain('>Yes</tspan>')
  expect(svg).toContain('>No</tspan>')
  expect(svg).toMatch(/M[\d.]+,([\d.]+)C([\d.]+),\1 \2,[\d.]+ [\d.]+,[\d.]+/)
  expect(flowchartDiagram({ nodes: [{ id: 'a' }], edges: [{ from: 'a', to: 'b' }] })).toBeUndefined()
  expect(flowchartDiagram({ nodes: [{ id: 'a' }, { id: 'a' }], edges: [] })).toBeUndefined()
})

test('renders ordered timeline data in both orientations with accessible metadata', () => {
  const sections = [{ name: 'Explore', periods: [{ label: 'Week 1', events: ['Research', '<Study> trends'] }] }]
  const down = timelineChart({ sections, direction: 'TD', idPrefix: 'roadmap', accessibleTitle: 'Delivery', description: 'The release plan' })!
  expect(down).toContain('data-direction="TD"')
  expect(down).toContain('aria-describedby="roadmap-description"')
  expect(down).toContain('aria-label="Delivery"')
  expect(down).toContain('&lt;Study&gt; trends')
  expect(down).toContain('stroke="currentColor"')
  expect(timelineChart({ sections, direction: 'LR' })).toContain('data-direction="LR"')
  expect(timelineChart({ sections: [] })).toBeUndefined()
})

test('groups flowchart steps and draws separate paths for parallel and returning connections', () => {
  const svg = flowchartDiagram({
    idPrefix: 'review',
    direction: 'right',
    routing: 'orthogonal',
    accessibleTitle: 'Review stages',
    description: 'Two services collaborate',
    groups: [{ label: 'Workers', members: ['input', 'queue'] }],
    nodes: [
      { id: 'input', shape: 'stadium' },
      { id: 'queue', shape: 'database', style: { fill: '#eceafd', strokeWidth: 2 } },
    ],
    edges: [
      { from: 'input', to: 'queue' },
      { from: 'input', to: 'queue', label: 'Fast path', style: 'dotted' },
      { from: 'queue', to: 'input', label: 'Return', start: 'circle', end: 'none', style: 'thick' },
    ],
  })!
  expect(svg).toContain('aria-describedby="review-description"')
  expect(svg).toContain('class="diagram-cluster"')
  expect(svg).toContain('--diagram-fill:#eceafd;--diagram-stroke-width:2')
  expect(svg).toContain('stroke-dasharray="5 4"')
  expect(svg).toContain('marker-start="url(#review-circle)"')
  const paths = [...svg.matchAll(/class="diagram-edge [^"]+"[^>]* d="([^"]+)"/g)].map(match => match[1])
  expect(paths).toHaveLength(3)
  expect(new Set(paths).size).toBe(3)
})

test('renders sequence messages, nested sections, notes, activation, and an accessible description', () => {
  const participants = [{ id: 'a', name: 'Author', actor: true }, { id: 'r', name: 'Review service' }]
  const svg = sequenceChart({
    idPrefix: 'exchange', numbered: true, accessibleTitle: 'Review exchange', description: 'An author shares a draft',
    participants,
    events: [
      { kind: 'message', from: 'a', to: 'r', label: 'Share draft', change: 'start' },
      { kind: 'section', title: 'Review' },
      { kind: 'note', ids: ['a', 'r'], label: 'Read <draft> and annotate' },
      { kind: 'branch', title: 'After approval' },
      { kind: 'message', from: 'r', to: 'a', label: 'Feedback', change: 'end', dashed: true },
      { kind: 'end' },
    ],
  })
  expect(svg).toContain('aria-describedby="exchange-description"')
  expect(svg).toContain('diagram-activation')
  expect(svg).toContain('diagram-sequence-note"><rect fill="#edf3fa"')
  expect(svg).toMatch(/<text [^>]*y="49"[^>]*><tspan[^>]*>Review service<\/tspan>/)
  expect(svg).toContain('2. Feedback')
  expect(svg).toContain('Read &lt;draft&gt; and annotate')
  expect(sequenceChart({ participants, events: [{ kind: 'end' }] })).toBeUndefined()
  expect(sequenceChart({ participants, events: [{ kind: 'note', ids: ['unknown'], label: '' }] })).toBeUndefined()
})

test('renders class and ER cards and validates relationship endpoints', () => {
  const cards = [{ id: 'project', fields: ['name: string'] }, { id: 'task', name: 'Task', operations: ['finish()'] }]
  const svg = relationshipChart({
    idPrefix: 'data', cards, kind: 'er', direction: 'right',
    edges: [{ source: 'project', target: 'task', start: 'one', end: 'zero-many', label: 'contains', dashed: true }],
  })
  expect(svg).toContain('data-diagram-kind="er"')
  expect(svg).toContain('marker-start="url(#data-one)"')
  expect(svg).toContain('marker-end="url(#data-zero-many)"')
  expect(svg).toContain('>finish()</tspan>')
  expect(svg).toContain('stroke-dasharray="5 4"')
  expect(relationshipChart({ cards, edges: [{ source: 'unknown', target: 'task' }] })).toBeUndefined()
})

test('renders full-circle donuts, raw legend values, and validated slice colors', () => {
  const svg = pieChart({
    title: 'Share of work', donutHole: 0.5, legendPosition: 'bottom', showData: true,
    slices: [{ label: 'Review <drafts>', value: 7, color: '#b5d2ef' }],
  })
  expect(svg).toContain('>100%</tspan>')
  expect(svg).toContain('Review &lt;drafts&gt; [7]')
  expect(svg).toContain('fill="#b5d2ef"')
  const wedge = /<path d="([^"]+)"/.exec(svg ?? '')?.[1] ?? ''
  expect(wedge).toMatch(/^M.*A130,130.*M.*A65,65.*Z$/)
  expect(pieChart({ slices: [{ label: 'Review', value: Number.NaN }] })).toBeUndefined()
})

test('draws quadrant points on normalized coordinates with styled and accessible labels', () => {
  const svg = quadrantChart({
    chartWidth: 400,
    chartHeight: 320,
    useMaxWidth: false,
    accessibleTitle: 'Assessment',
    description: 'Effort against reach',
    idPrefix: 'rubric',
    xAxis: ['Low effort', 'High effort'],
    yAxis: ['Low reach', 'High reach'],
    quadrants: ['Plan', 'Expand', 'Review', 'Defer'],
    points: [{ label: 'Review <later>', x: 1, y: 0, radius: 8, color: '#345678', strokeColor: '#123456', strokeWidth: 3 }],
  })!
  expect(svg).toMatch(/^<svg width="400" height="320"/)
  expect(svg).toContain('aria-labelledby="rubric-title" aria-describedby="rubric-description"')
  expect(svg.match(/data-quadrant="[1-4]"/g)).toHaveLength(4)
  expect(svg).toContain('cx="395" cy="289" r="8" fill="#345678" stroke="#123456" stroke-width="3"')
  expect(svg).toContain('Review &lt;later&gt;')
  expect(svg).toContain('>High reach</tspan>')
  expect(quadrantChart({ points: [{ label: 'Out', x: 1.1, y: 0 }] })).toBeUndefined()
})

test('plots native journey scores and deduplicates actors per task', () => {
  const phases = [{ name: 'Plan', tasks: [{ name: 'Draft', score: 4, actors: ['Author', 'Author'] }, { name: 'Review', score: 2 }] }]
  const drawing = journeyChart({ phases, actorColors: ['#0f6681'] })!
  expect(drawing).toContain('data-score="4"')
  expect(drawing).toContain('data-score="2"')
  expect(drawing).toContain('fill="#0f6681"')
  expect(drawing.match(/<title>Author<\/title>/g)).toHaveLength(1)
  expect(drawing).toMatch(/class="diagram-journey-trajectory"[^>]+d="M[^"]+L/)
  expect(journeyChart({ phases: [{ tasks: [{ name: 'Review', score: 6 }] }] })).toBeUndefined()
})

test('paints critical task borders independently of status and labels vertical references', () => {
  const svg = ganttChart({
    displayMode: 'compact',
    palette: { task: { fill: '#bbccdd' }, active: { fill: '#117766', border: '#ddffee' }, critical: { border: '#aa1122' }, reference: '#abcdef', grid: '#123456', statusText: '#eee' },
    sections: [{ tasks: [
      { name: 'Build', id: 'build', start: '2026-03-06', duration: '3d', tags: ['active', 'crit'] },
      { name: 'Review', id: 'review', start: '2026-03-06', duration: '1d' },
      { name: 'Review opens', id: 'opens', start: '2026-03-06', duration: '1d', tags: ['vert'] },
      { name: 'Deadline', id: 'deadline', start: '2026-03-06', duration: '0d', tags: ['vert'] },
    ] }],
  })!
  expect(svg).toContain('style="fill:#117766;stroke:#aa1122;stroke-width:2px"')
  expect(svg).toContain('style="fill:#bbccdd"')
  expect(svg).toContain('style="stroke:#123456"')
  expect(svg).toMatch(/class="diagram-gantt-label"[^>]*style="fill:#eee;"[^>]*><tspan[^>]*>Build</)
  const markerX = [...svg.matchAll(/class="diagram-gantt-reference"[^>]*style="stroke:#abcdef" d="M([\d.]+)/g)].map(match => match[1])
  const barX = /class="diagram-gantt-bar"[^>]*\bx="([\d.]+)"/.exec(svg)![1]
  expect(markerX).toEqual([barX, barX])
  expect(svg).toMatch(/data-task-id="opens"[^>]*data-task-start="2026-03-06T00:00:00.000Z"/)
  const captions = [...svg.matchAll(/ y="([\d.]+)" class="diagram-gantt-reference-label"[^>]*><tspan[^>]*>([^<]+)</g)]
  expect(captions.map(match => match[2])).toEqual(['Review opens', 'Deadline'])
  expect(Number(captions[1][1])).toBeGreaterThan(Number(captions[0][1]))
})

test('keeps full Gantt marker labels in separate rows below the axis', () => {
  const name = 'Release readiness review for customer documentation<br>Approval from all reviewers'
  const svg = ganttChart({
    width: 225, leftPadding: 30, rightPadding: 0, fontSize: 16, todayMarker: false,
    sections: [{ tasks: [
      { name: 'Build', start: '2026-03-06', duration: '3d' },
      { name, id: 'review', start: '2026-03-06', duration: '0d', tags: ['vert'] },
      { name: 'Publish', id: 'publish', start: '2026-03-06', duration: '0d', tags: ['vert'] },
    ] }],
  })!
  const labels = [...svg.matchAll(/ y="([\d.]+)" class="diagram-gantt-reference-label"[^>]*>(.*?)<\/text>/g)]
  const lines = [...labels[0][2].matchAll(/<tspan[^>]*>([^<]+)<\/tspan>/g)].map(match => match[1])
  expect(lines.length).toBeGreaterThan(2)
  expect(lines.join(' ')).toBe(name.replace('<br>', ' '))
  expect(Number(labels[1][1]) - Number(labels[0][1])).toBeGreaterThan(lines.length * 16 * 1.15 / 2)
  const height = Number(/viewBox="0 0 225 ([\d.]+)"/.exec(svg)?.[1])
  expect(height).toBeGreaterThan(Number(labels[1][1]) + 8)
})

test('schedules structured tasks across exclusions and resolves multiple dependency endpoints', () => {
  const chart: GanttChartOptions = {
    idPrefix: 'delivery', accessibleTitle: 'Delivery window', now: Date.UTC(2026, 2, 6), todayMarker: false,
    excludes: ['weekends', '2026-03-10'], includes: ['2026-03-08'],
    sections: [
      { name: 'Prepare', tasks: [
        { id: 'scope', name: 'Agree scope', duration: '2d' },
        { id: 'plan', name: 'Plan delivery', start: '2026-03-06', duration: '1d' },
      ] },
      { name: 'Deliver', tasks: [
        { id: 'build', name: 'Build', after: ['scope', 'plan'], duration: '3d', tags: ['active'] },
        { id: 'review', name: 'Review', after: ['scope'], until: ['build', 'ship'] },
        { id: 'ship', name: 'Ship', start: '2026-03-13', duration: '0d', tags: ['milestone'] },
      ] },
    ],
  }
  const date = (time: number) => new Date(time).toISOString().slice(0, 10)
  const tasks = scheduleGantt(chart)?.tasks
  expect(tasks?.map(task => [task.id, date(task.start), date(task.end)])).toEqual([
    ['scope', '2026-03-06', '2026-03-09'],
    ['plan', '2026-03-06', '2026-03-07'],
    ['build', '2026-03-09', '2026-03-13'],
    ['review', '2026-03-09', '2026-03-09'],
    ['ship', '2026-03-13', '2026-03-13'],
  ])
  const svg = ganttChart(chart)
  expect(svg).toContain('data-diagram-kind="gantt"')
  expect(svg).toContain('aria-labelledby="delivery-title"')
  expect(svg).toContain('class="diagram-gantt-milestone-shape"')
  expect(svg).not.toContain('diagram-gantt-today')
  expect(scheduleGantt({ sections: [{ tasks: [
    { name: 'First', id: 'a', after: ['b'], duration: '1d' },
    { name: 'Second', id: 'b', after: ['a'], duration: '1d' },
  ] }] })).toBeUndefined()
  expect(scheduleGantt({ sections: [{ tasks: [{ name: 'Conflicting end', end: '2026-03-06', duration: '1d' }] }] })).toBeUndefined()
})

test('keeps whole-day exclusions between bars while advancing dependent tasks', () => {
  const chart: GanttChartOptions = {
    exclusionMode: 'whole-days',
    excludes: ['weekends', '2026-03-10'],
    sections: [{ tasks: [
      { name: 'Draft', id: 'draft', start: '2026-03-06', duration: '1d' },
      { name: 'Review', id: 'review', after: ['draft'], duration: '2d' },
      { name: 'Final check', id: 'check', after: ['review'], duration: '1d' },
    ] }],
  }
  const march = (day: number) => Date.UTC(2026, 2, day)
  expect(scheduleGantt(chart)?.tasks.map(({ start, end, barEnd }) => [start, end, barEnd])).toEqual([
    [march(6), march(9), march(7)],
    [march(9), march(12), undefined],
    [march(12), march(13), undefined],
  ])
  const svg = ganttChart(chart)!
  expect(svg.match(/class="diagram-gantt-excluded"/g)).toHaveLength(3)
  expect(svg).toContain('data-task-end="2026-03-09T00:00:00.000Z" data-task-bar-end="2026-03-07T00:00:00.000Z"')
  const bars = [...svg.matchAll(/class="diagram-gantt-bar"[^>]* x="([\d.]+)"[^>]* width="([\d.]+)"/g)]
    .map(([, x, width]) => ({ x: Number(x), width: Number(width) }))
  expect(bars).toHaveLength(3)
  expect(bars[1].x - (bars[0].x + bars[0].width)).toBeCloseTo(bars[0].width * 2)
  expect(bars[1].width).toBeCloseTo(bars[0].width * 3)
})

test('coalesces exclusion ranges through the last scheduled day on long Gantt charts', () => {
  const chart: GanttChartOptions = {
    excludes: ['weekends'],
    includes: ['2024-01-07'],
    exclusionBands: 'ranges',
    sections: [{ tasks: [{ name: 'Launch', start: '2024-01-05', end: '2025-01-05' }] }],
  }
  const ranges = (options: GanttChartOptions) =>
    [...ganttChart(options)!.matchAll(/data-excluded-start="([^"]+)" data-excluded-end="([^"]+)"/g)]
      .map(([, start, end]) => [start, end])
  const bands = ranges(chart)
  expect(bands).toHaveLength(53)
  expect(bands.slice(0, 2)).toEqual([['2024-01-06', '2024-01-07'], ['2024-01-13', '2024-01-15']])
  expect(bands.at(-1)).toEqual(['2025-01-04', '2025-01-06'])
  expect(ganttChart({ ...chart, exclusionBands: undefined })).not.toContain('diagram-gantt-excluded')

  const through = (end: string) => ({ ...chart, sections: [{ tasks: [{ ...chart.sections[0].tasks[0], end }] }] })
  expect(ranges(through('2029-12-05')).length).toBeGreaterThan(300)
  expect(ranges(through('2030-01-05'))).toEqual([])
})

test('adjusts custom end dates and until targets when a fixed date format is supplied', () => {
  const march = (day: number) => Date.UTC(2026, 2, day)
  const chart: GanttChartOptions = {
    dateFormat: 'DD-MM-YYYY', exclusionMode: 'whole-days', excludes: ['weekends'],
    sections: [{ tasks: [
      { name: 'Custom end date', id: 'custom', start: '06-03-2026', end: '07-03-2026' },
      { name: 'Review window', id: 'window', start: '06-03-2026', until: ['ship'] },
      { name: 'Ship', id: 'ship', start: '07-03-2026', duration: '0d', tags: ['milestone'] },
      { name: 'Follow-up', after: ['custom', 'window'], duration: '1d' },
    ] }],
  }
  const times = (options: GanttChartOptions) => scheduleGantt(options)?.tasks.map(({ start, end, barEnd }) => [start, end, barEnd])
  expect(times(chart)).toEqual([
    [march(6), march(7), undefined],
    [march(6), march(7), undefined],
    [march(7), march(7), undefined],
    [march(7), march(9), march(8)],
  ])
  expect(times({ ...chart, fixedEndDateFormat: 'YYYY-MM-DD' })).toEqual([
    [march(6), march(9), march(7)],
    [march(6), march(9), march(7)],
    [march(7), march(7), undefined],
    [march(9), march(10), undefined],
  ])
})

test('matches complete Gantt calendar tokens without expanding them into full-day exclusions', () => {
  const chart: GanttChartOptions = {
    dateFormat: 'YYYY-MM-DD[T]HH:mm',
    exclusionMode: 'whole-days',
    excludes: ['unknown', '2026-03-07T10:00'],
    sections: [{ tasks: [
      { name: 'Early', start: '2026-03-06T08:00', duration: '1d' },
      { name: 'Late', start: '2026-03-06T10:00', duration: '1d' },
    ] }],
  }
  expect(scheduleGantt(chart)).toBeUndefined()
  const ends = (options: GanttChartOptions) => scheduleGantt(options)?.tasks.map(({ end }) => new Date(end).toISOString())
  expect(ends({ ...chart, excludes: ['2026-03-07T10:00'] })).toEqual([
    '2026-03-08T08:00:00.000Z', '2026-03-08T10:00:00.000Z',
  ])
  expect(ends({ ...chart, calendarMatch: 'formatted' })).toEqual([
    '2026-03-07T08:00:00.000Z', '2026-03-08T10:00:00.000Z',
  ])
  expect(ends({ ...chart, calendarMatch: 'formatted', excludes: ['weekends'], includes: ['2026-03-07T10:00'] })).toEqual([
    '2026-03-09T08:00:00.000Z', '2026-03-07T10:00:00.000Z',
  ])
})

test('recovers missing Gantt references when requested and rejects cycles', () => {
  const chart: GanttChartOptions = {
    now: Date.UTC(2026, 2, 6, 15),
    sections: [{ tasks: [
      { name: 'Initial', id: 'initial', start: '2026-03-02', duration: '1d' },
      { name: 'Review', after: ['unknown', 'initial'], duration: '1d' },
      { name: 'Publish', id: 'publish', start: '2026-03-10', until: ['unknown'] },
      { name: 'Follow-up', after: ['publish'], duration: '1d' },
      { name: 'Planning', after: ['unknown'], duration: '1d' },
    ] }],
  }
  const march = (day: number) => Date.UTC(2026, 2, day)
  expect(scheduleGantt(chart)).toBeUndefined()
  expect(scheduleGantt({ ...chart, missingDependencyFallback: 'today' })?.tasks.map(({ start, end }) => [start, end])).toEqual([
    [march(2), march(3)], [march(3), march(4)], [march(10), march(10)], [march(10), march(11)], [march(6), march(7)],
  ])
  expect(scheduleGantt({ ...chart, missingDependencyFallback: 'today', sections: [{ tasks: [
    { name: 'Cycle', id: 'cycle', after: ['missing', 'cycle'], duration: '1d' },
  ] }] })).toBeUndefined()
})

test('parses calendar ordinals, fractions of a second, and partial Gantt dates in UTC', () => {
  const reference = Date.UTC(2026, 2, 6, 10, 15, 0, 50)
  const cases = [
    ['YYYY-DDD HH:mm:ss.S', '2024-60 01:02:03.4', '2024-02-29T01:02:03.400Z'],
    ['YYYY-DDDD HH:mm:ss.SS Z', '2024-366 23:59:59.05 -01:00', '2025-01-01T00:59:59.050Z'],
    ['Do MMM YYYY[,] hh:mm A', '23rd Jan 2026, 12:00 AM', '2026-01-23T00:00:00.000Z'],
    ['hh:mm A ZZ', '12:00 AM +0230', '2026-03-05T21:30:00.000Z'],
    ['DD/MM', '09/07', '2026-07-09T00:00:00.000Z'],
    ['Q', '4', '2026-10-01T00:00:00.000Z'],
    ['Y', '2025', '2025-01-01T00:00:00.000Z'],
    ['X', '1410715640.579', '2014-09-14T17:27:20.579Z'],
  ]
  for (const [format, input, expected] of cases) expect(ganttDateParser(format, reference)(input)).toBe(Date.parse(expected))
  expect(ganttDateParser('YYYY-DDDD', reference)('2025-366')).toBeUndefined()
  expect(ganttDateParser('YYYY-DDDD', reference)('2024-000')).toBeUndefined()
  expect(ganttDateParser('Do MMM YYYY', reference)('11st Jan 2026')).toBeUndefined()
  expect(ganttDateParser('hh:mm', reference)('13:25')).toBeUndefined()
})

test('anchors time-only tasks and the today marker to the same reference day', () => {
  const now = Date.UTC(2026, 2, 6, 10, 15, 0, 50)
  const chart: GanttChartOptions = {
    now,
    dateFormat: 'HH:mm:ss.SS',
    axisFormat: '%S.%L',
    tickInterval: '10millisecond',
    sections: [{ tasks: [{ name: 'Measure', start: '10:15:00.01', duration: '80ms' }] }],
  }
  expect(scheduleGantt(chart)?.tasks.map(({ start, end }) => [start, end])).toEqual([[now - 40, now + 40]])
  const svg = ganttChart(chart)
  expect(svg).toContain('class="diagram-gantt-today"')
  expect(svg).toContain('>00.010</tspan>')
  expect(svg).toContain('>00.090</tspan>')
})

test('schedules unpadded elapsed second input and applies opt-in calendar duration rules', () => {
  const now = Date.UTC(2026, 2, 6, 14)
  const midnight = Date.UTC(2026, 2, 6)
  const seconds = { now, dateFormat: 'ss', tickInterval: '10second', sections: [{ tasks: [
    { id: 'sample', name: 'Sample', start: '0', end: '20' },
    { name: 'Follow up', after: ['sample'], duration: '0.5s' },
  ] }] }
  const schedule = scheduleGantt(seconds)!
  expect(schedule.axisFormat).toBe('%S')
  expect(schedule.tasks.map(task => [task.start - midnight, task.end - midnight])).toEqual([[0, 20_000], [20_000, 20_500]])
  expect(ganttChart(seconds)).toMatch(/>00<\/tspan>.*>10<\/tspan>.*>20<\/tspan>/s)
  expect(ganttDateParser('ss', now)('60')).toBeUndefined()
  expect(ganttDateParser('HH:mm:ss', now)('00:00:0')).toBeUndefined()

  const chart: GanttChartOptions = { sections: [{ tasks: [
    { id: 'first', name: 'First', start: '2024-02-29', duration: '1.5d' },
    { id: 'second', name: 'Second', after: ['first'], duration: '0.5w' },
    { name: 'Month end', start: '2024-01-31', duration: '1.5M' },
    { name: 'Leap year', start: '2024-02-29', duration: '1.5y' },
  ] }] }
  const ends = (settings: GanttChartOptions) => scheduleGantt(settings)?.tasks.map(task => new Date(task.end).toISOString())
  expect(ends({ ...chart, durationMode: 'calendar' })).toEqual([
    '2024-03-02T00:00:00.000Z', '2024-03-06T00:00:00.000Z', '2024-02-29T00:00:00.000Z', '2025-02-28T00:00:00.000Z',
  ])
  expect(ends(chart)?.[0]).toBe('2024-03-01T12:00:00.000Z')
})

test('shares Gantt style indices across repeated sections and their tasks', () => {
  const at = '2026-03-02'
  const svg = ganttChart({
    numberSectionStyles: 2, sectionColors: ['red', 'blue'],
    sections: [
      { name: 'Plan', tasks: [{ id: 'draft', name: 'Draft', start: at, duration: '1d' }] },
      { name: 'Events', tasks: [{ id: 'note', name: 'Note', start: at, duration: '0d', tags: ['vert'] }] },
      { name: 'Review', tasks: [{ id: 'check', name: 'Check', start: at, duration: '1d', tags: ['active'] }] },
      { name: 'Plan', tasks: [{ id: 'revise', name: 'Revise', start: at, duration: '1d' }] },
    ],
  })!
  const sections = [...svg.matchAll(/class="diagram-gantt-section" data-gantt-style-index="(\d)"[^]*?style="fill:(\w+);/g)]
  expect(sections.map(([, index, color]) => [index, color])).toEqual([['0', 'red'], ['1', 'blue'], ['0', 'red']])
  const tasks = [...svg.matchAll(/data-task-id="(\w+)"[^>]*data-gantt-style-index="(\d)"/g)]
  expect(Object.fromEntries(tasks.map(([, id, index]) => [id, index]))).toEqual({ note: '0', draft: '0', check: '1', revise: '0' })
})

test('replays structured Git history with merge ordering, orientation, and cherry-pick validation', () => {
  const chart: GitGraphOptions = {
    idPrefix: 'history', accessibleTitle: 'Project history', direction: 'TB', parallelCommits: true,
    operations: [
      { op: 'commit', id: 'root' },
      { op: 'branch', name: 'review', order: 3 },
      { op: 'commit', id: 'draft' },
      { op: 'checkout', name: 'main' },
      { op: 'commit', id: 'prepare', label: 'Prep work' },
      { op: 'merge', branch: 'review', id: 'release', tags: ['v1.0'] },
      { op: 'checkout', name: 'review' },
      { op: 'cherry-pick', commit: 'release', parent: 'draft', id: 'backport' },
    ],
  }
  const history = buildGitHistory(chart)
  expect(history?.commits.map(commit => [commit.id, commit.rank])).toEqual([
    ['root', 0], ['draft', 1], ['prepare', 1], ['release', 2], ['backport', 3],
  ])
  expect(history?.commits[3].parents.map(commit => commit.id)).toEqual(['prepare', 'draft'])
  expect(history?.commits[3].message).toBe('merged branch review into main')
  expect(history?.commits.at(-1)?.picked).toBe('release')
  expect(history?.commits.at(-1)?.message).toBe('cherry-picked merged branch review into main into review')
  expect(history?.commits.at(-1)?.parents.map(commit => commit.id)).toEqual(['draft'])
  const parentsWithSource = buildGitHistory({ ...chart, cherryPickSourceParent: true })?.commits.at(-1)?.parents
  expect(parentsWithSource?.map(commit => commit.id)).toEqual(['draft', 'release'])
  const sourceEdge = /data-from-commit="release" data-to-commit="backport"/g
  expect(gitGraphChart({ ...chart, cherryPickSourceParent: true })?.match(sourceEdge)).toHaveLength(1)
  const svg = gitGraphChart(chart)
  expect(svg).toContain('data-diagram-kind="gitgraph"')
  expect(svg).toContain('aria-label="Project history"')
  expect(svg).toContain('data-commit-id="release" data-parent-ids="prepare, draft"')
  expect(svg).toContain('>Prep work</tspan>')
  expect(svg).toContain('>v1.0</tspan>')
  expect(svg).toContain('data-commit-id="backport" data-parent-ids="draft" data-picked-id="release" data-picked-parent="draft"')
  expect(svg).toMatch(/class="diagram-git-edge diagram-git-pick-edge"[^>]*stroke-dasharray="5 3" data-from-commit="release" data-to-commit="backport"/)
  expect(svg).toMatch(/class="diagram-git-branch" data-git-branch-index="1"><title>review<\/title>/)
  expect(svg).toMatch(/data-commit-id="release"[^>]*data-git-branch-index="0" data-git-symbol="merge"/)
  expect([...svg!.matchAll(/class="diagram-git-edge[^"]*"[^>]*stroke="([^"]+)" data-git-branch-index="(\d)"/g)]
    .map(([, stroke, index]) => [index, stroke])).toEqual([
    ['1', '#e7b76f'], ['0', '#6ba2db'], ['0', '#6ba2db'], ['1', '#e7b76f'], ['1', '#e7b76f'], ['0', '#6ba2db'],
  ])
  const withoutEmptyTags: GitGraphOptions = { ...chart, operations: [...chart.operations.slice(0, -1),
    { op: 'cherry-pick', commit: 'release', parent: 'draft', tags: ['', 'backport', ''] },
  ] }
  expect(buildGitHistory(withoutEmptyTags)?.commits.at(-1)?.tags).toEqual(['backport'])
  expect(buildGitHistory({ ...chart, operations: [...chart.operations.slice(0, -1),
    { op: 'cherry-pick', commit: 'release', parent: 'root' },
  ] })).toBeUndefined()
})

test('keeps styled merges connected and preserves commit messages alongside IDs', () => {
  const chart: GitGraphOptions = {
    background: '#eeeeee',
    colors: ['#225566', '#775599'],
    highlightColors: ['#ddccbb'],
    operations: [
      { op: 'commit', id: 'base', message: 'Set up <draft>' },
      { op: 'branch', name: 'review' },
      { op: 'commit', id: 'fix', style: 'REVERSE' },
      { op: 'checkout', name: 'main' },
      { op: 'merge', id: 'signed', branch: 'review', style: 'NORMAL' },
      { op: 'checkout', name: 'review' },
      { op: 'commit', id: 'draft' },
      { op: 'checkout', name: 'main' },
      { op: 'merge', id: 'release', branch: 'review', style: 'HIGHLIGHT' },
    ],
  }
  const history = buildGitHistory(chart)!
  expect(history.commits.map(({ id, symbol }) => [id, symbol])).toEqual([
    ['base', 'NORMAL'], ['fix', 'REVERSE'], ['signed', 'NORMAL'], ['draft', 'NORMAL'], ['release', 'HIGHLIGHT'],
  ])
  expect(history.commits.at(-1)?.parents.map(parent => parent.id)).toEqual(['signed', 'draft'])
  const svg = gitGraphChart(chart)!
  expect(svg).toContain('data-commit-message="Set up &lt;draft&gt;"')
  expect(svg).toContain('<title>main / base / Set up &lt;draft&gt;</title>')
  expect(svg).toMatch(/data-commit-id="fix"[^>]*><title>[^<]*<\/title><circle[^>]+fill="#775599"\/><path class="diagram-git-reverse-mark"[^>]+stroke="#eeeeee"/)
  expect(svg).toMatch(/data-commit-id="signed" data-parent-ids="base, fix"[^>]*><title>[^<]*<\/title><circle[^>]*\/><text/)
  expect(svg).toMatch(/data-commit-id="release"[^>]*><title>[^<]*<\/title><rect[^>]+fill="#ddccbb"\/><rect class="diagram-git-highlight-inner"[^>]+fill="#225566"/)
})

test('fits complete GitGraph branch, commit, and tag labels when truncation is disabled', () => {
  const labels = {
    branch: 'feature/review-release-candidate-across-all-supported-platforms',
    commit: 'reviewed-and-approved-release-candidate-for-production',
    tag: 'release-candidate-build-with-integration-verification',
  }
  const chart: GitGraphOptions = {
    operations: [
      { op: 'commit', id: 'root' },
      { op: 'branch', name: labels.branch },
      { op: 'commit', id: labels.commit, tags: [labels.tag] },
    ],
  }
  const width = (svg: string) => Number(/viewBox="0 0 ([\d.]+)/.exec(svg)?.[1])
  for (const direction of ['LR', 'TB', 'BT'] as const) {
    for (const rotateCommitLabel of [true, false]) {
      const options = { ...chart, direction, rotateCommitLabel }
      const compact = gitGraphChart(options)!
      const full = gitGraphChart({ ...options, truncateLabels: false })!
      expect(compact).toContain('…</tspan>')
      for (const label of Object.values(labels)) expect(full).toContain(`>${label}</tspan>`)
      expect(full).not.toContain('…</tspan>')
      expect(width(full)).toBeGreaterThan(width(compact))
    }
  }
})

test('places vertical GitGraph branch labels at the beginning of the timeline', () => {
  const chart: GitGraphOptions = {
    geometry: 'compact',
    branchLabelBackgrounds: ['#eeeeee', '#eeeeee'],
    operations: [
      { op: 'commit', id: 'root', tags: ['tagged<br>initial'] },
      { op: 'branch', name: 'maintenance<br>review' },
      { op: 'commit', id: 'second' },
    ],
  }
  const rootY = (svg: string) => Number(/data-commit-id="root".*?<circle[^>]+cy="([\d.]+)"/.exec(svg)?.[1])
  const branchBoxes = (svg: string) => [...svg.matchAll(/class="diagram-git-branch-label-box"[^>]+y="([\d.]+)"[^>]+height="([\d.]+)"/g)]
    .map(([, y, height]) => ({ top: Number(y), bottom: Number(y) + Number(height) }))
  const bottom = gitGraphChart({ ...chart, direction: 'BT' })!
  const top = gitGraphChart({ ...chart, direction: 'TB' })!
  expect(branchBoxes(bottom)).toHaveLength(2)
  expect(branchBoxes(top)).toHaveLength(2)
  const bottomEdge = Number(/viewBox="0 0 [\d.]+ ([\d.]+)"/.exec(bottom)?.[1])
  for (const { top, bottom: edge } of branchBoxes(bottom)) {
    expect(top).toBeGreaterThan(rootY(bottom))
    expect(edge).toBeLessThan(bottomEdge)
  }
  for (const box of branchBoxes(top)) expect(box.bottom).toBeLessThan(rootY(top))
})

test('can lay out GitGraph tags individually and preserve joined labels by default', () => {
  const chart: GitGraphOptions = {
    operations: [{ op: 'commit', id: 'release', tags: ['candidate', 'signed<br>and tested', 'stable'] }],
    tagLabel: { background: '#eeeeee', border: '#222222', fontSize: 16 },
    truncateLabels: false,
  }
  expect(gitGraphChart(chart)!.match(/class="diagram-git-tag-box"/g)).toHaveLength(1)
  for (const direction of ['LR', 'TB', 'BT'] as const) {
    const svg = gitGraphChart({ ...chart, direction, tagLayout: 'stacked' })!
    expect(svg.match(/class="diagram-git-tag-box"/g)).toHaveLength(3)
    const positions = [...svg.matchAll(/<text[^>]+ y="([\d.]+)" class="diagram-git-tag"[^>]*>(.*?)<\/text>/g)]
    expect(positions.map(([, , text]) => text.replace(/<[^>]+>/g, ''))).toEqual(['stable', 'signedand tested', 'candidate'])
    const offsets = positions.map(([, y]) => Number(y))
    expect(offsets).toEqual([...offsets].sort((a, b) => direction === 'LR' ? b - a : a - b))
  }
})

test('renders opt-in GitGraph tag shapes with one hole per label', () => {
  const chart: GitGraphOptions = {
    operations: [{ op: 'commit', id: 'release', tags: ['candidate', 'signed<br>and tested', 'stable'] }],
    tagLayout: 'stacked',
  }
  const plain = gitGraphChart(chart)!
  expect(plain).not.toContain('diagram-git-tag-hole')

  for (const direction of ['LR', 'TB', 'BT'] as const) {
    const svg = gitGraphChart({
      ...chart,
      direction,
      tagLabel: { shape: 'tag', background: '#eeeeee', border: '#222222', holeColor: '#123456' },
    })!
    expect(svg.match(/<polygon class="diagram-git-tag-box"[^>]+fill="#eeeeee" stroke="#222222"/g)).toHaveLength(3)
    expect(svg.match(/<circle class="diagram-git-tag-hole"[^>]+r="1.5" fill="#123456"/g)).toHaveLength(3)
  }
})

test('shows authored Git labels below horizontal commits and keeps generated operation metadata', () => {
  const chart: GitGraphOptions = { showGeneratedOperationLabels: false, operations: [
    { op: 'commit', id: 'root', tags: ['v1'] },
    { op: 'branch', name: 'review' },
    { op: 'commit', id: 'patch' },
    { op: 'checkout', name: 'main' },
    { op: 'cherry-pick', commit: 'patch' },
    { op: 'merge', branch: 'review' },
    { op: 'checkout', name: 'review' },
    { op: 'commit', id: 'docs' },
    { op: 'checkout', name: 'main' },
    { op: 'merge', branch: 'review', id: 'release' },
  ] }
  const svg = gitGraphChart(chart)!
  const labels = (markup: string) =>
    [...markup.matchAll(/class="diagram-git-label"[^>]*><tspan[^>]*>([^<]+)/g)].map(match => match[1])
  expect(labels(svg)).toEqual(['root', 'patch', 'docs', 'release'])
  expect(labels(gitGraphChart({ ...chart, showGeneratedOperationLabels: true })!)).toEqual(['root', 'patch', 'c3', 'c4', 'docs', 'release'])
  expect(svg).toContain('data-commit-id="c3" data-parent-ids="root" data-picked-id="patch"')
  expect(svg).toContain('data-commit-id="c4" data-parent-ids="c3, patch"')
  expect(svg).toContain('>cherry-pick:patch</tspan>')
  const coordinates = /data-commit-id="root"[^>]*><title>[^<]*<\/title><circle[^>]*cy="([\d.]+)"[^>]*\/><text[^>]*y="([\d.]+)" class="diagram-git-label"[^>]*>.*?<\/text><text[^>]*y="([\d.]+)" class="diagram-git-tag"/s.exec(svg)
  expect(coordinates).not.toBeNull()
  const [dot, label, tag] = coordinates!.slice(1).map(Number)
  expect(label).toBeGreaterThan(dot)
  expect(tag).toBeLessThan(dot)
})

test('accepts ISO holidays with custom task dates and packs touching bars around milestones', () => {
  const calendar = scheduleGantt({
    dateFormat: 'DD/MM/YYYY', excludes: ['2026-03-06', '07/03/2026'], includes: ['2026-03-07'],
    sections: [{ tasks: [{ name: 'Delivery', start: '06/03/2026', duration: '1d' }] }],
  })!
  expect(calendar.isExcluded(Date.UTC(2026, 2, 6))).toBe(true)
  expect(calendar.isExcluded(Date.UTC(2026, 2, 7))).toBe(false)
  expect(calendar.tasks[0].end).toBe(Date.UTC(2026, 2, 8))
  const compact = ganttChart({
    displayMode: 'compact', sections: [{ tasks: [
      { name: 'Build', id: 'build', start: '2026-03-06', duration: '1d' },
      { name: 'Verify', id: 'verify', after: ['build'], duration: '1d' },
      { name: 'Ship', id: 'ship', after: ['verify'], duration: '0d', tags: ['milestone'] },
    ] }],
  })!
  const barRows = [...compact.matchAll(/class="diagram-gantt-bar"[^>]*\by="([\d.]+)"/g)].map(match => match[1])
  expect(barRows).toHaveLength(2)
  expect(barRows[0]).toBe(barRows[1])
  const labels = [...compact.matchAll(/ y="([\d.]+)" class="diagram-gantt-label"/g)].map(match => Number(match[1]))
  expect(labels[2]).toBeGreaterThan(labels[1])
  expect(compact.match(/class="diagram-gantt-label" text-anchor="middle"[^>]*style="fill:#122434;"/g)).toHaveLength(2)
})

test('reserves vertical space for multiline Gantt headings and draws repeated markers once', () => {
  const chart: GanttChartOptions = { sections: [{ name: 'Release<br>Review<br />Ship', tasks: [
    { id: 'edge', name: 'Review', start: '2026-01-01', duration: '1d', tags: ['vert'] },
    { id: 'edge', name: 'Review', start: '2026-01-01', duration: '1d', tags: ['vert'] },
    { id: 'work', name: 'Draft', after: ['edge'], duration: '1d' },
  ] }] }
  expect(scheduleGantt(chart)?.tasks.at(-1)?.start).toBe(Date.UTC(2026, 0, 2))
  const svg = ganttChart(chart)!
  expect(svg.match(/class="diagram-gantt-reference-label"/g)).toHaveLength(1)
  expect(svg).toMatch(/class="diagram-gantt-section-label"[^>]*><tspan[^>]*dy="-16">Release<\/tspan><tspan[^>]*dy="16">Review<\/tspan><tspan[^>]*dy="16">Ship/)
  const band = (output: string) => Number(/class="diagram-gantt-band"[^>]*height="([^"]+)"/.exec(output)?.[1])
  expect(band(svg) - band(ganttChart({ sections: [{ ...chart.sections[0], name: 'Release' }] })!)).toBe(32)
  expect(scheduleGantt({ sections: [{ tasks: [...chart.sections[0].tasks, { id: 'work', name: 'Second draft', duration: '1d' }] }] })).toBeUndefined()
})

test('supports linked Gantt tasks, marker styling, chart dimensions, and week start', () => {
  const svg = ganttChart({
    now: Date.UTC(2026, 2, 9), tickInterval: '1week', axisFormat: '%A',
    weekday: 'monday', topAxis: true, barHeight: 24, barGap: 6, topPadding: 30, leftPadding: 90, rightPadding: 40,
    todayMarkerStyle: { stroke: '#0a5', strokeWidth: 5, opacity: 0.5 },
    sections: [{ tasks: [
      { name: 'A & B', start: '2026-03-06', duration: '8d', href: '#review' },
      { name: 'Review', start: '2026-03-10', duration: '1d', href: 'javascript:alert(1)' },
    ] }],
  })!
  expect(svg).toContain('viewBox="0 0 840 ')
  expect(svg).toContain('role="group"')
  expect(svg).toContain('<a class="diagram-gantt-link" href="#review" target="_self" aria-label="A &amp; B">')
  expect(svg).not.toContain('javascript:')
  expect(svg).toContain('style="stroke:#0a5;stroke-width:5px;opacity:0.5"')
  expect(svg).toMatch(/class="diagram-gantt-bar"[^>]*height="24"/)
  expect(svg.match(/>Monday<\/tspan>/g)).toHaveLength(2)
  expect(svg).not.toContain('>sunday</tspan>')
})

test('renders Gantt today markers with functional colors and custom stroke patterns', () => {
  const chart: GanttChartOptions = {
    now: Date.UTC(2026, 2, 9),
    sections: [{ tasks: [{ name: 'Build', start: '2026-03-06', duration: '8d' }] }],
    todayMarkerStyle: {
      stroke: 'rgb(16, 128, 90)', strokeWidth: 1.5, opacity: 0.8, strokeOpacity: 0.6,
      strokeDasharray: [5, 3], strokeDashoffset: -1, strokeLinecap: 'round',
    },
  }
  expect(ganttChart(chart)).toContain('style="stroke:rgb(16, 128, 90);stroke-width:1.5px;opacity:0.8;stroke-opacity:0.6;stroke-dasharray:5 3;stroke-dashoffset:-1;stroke-linecap:round"')
  expect(ganttChart({ ...chart, todayMarkerStyle: { strokeDasharray: 'none' } })).toContain('style="stroke-dasharray:none"')
  expect(ganttChart({ ...chart, todayMarkerStyle: { stroke: 'url(#paint)', strokeDasharray: [5, -1], strokeOpacity: 2 } }))
    .toMatch(/class="diagram-gantt-today" stroke="#d66550" fill="none" d=/)
})

test('rotates Git commit labels in horizontal and vertical graphs and retains tags', () => {
  const operations = [{ op: 'commit', id: 'start', label: 'A descriptive label for a commit', tags: ['v1'] }] as const
  const sideways = gitGraphChart({ operations, rotateCommitLabel: true })
  expect(sideways).toMatch(/transform="rotate\(45 [\d.]+ [\d.]+\)"><text/)
  expect(sideways).toContain('>A descriptive label for a commit</tspan>')
  expect(sideways).toContain('>v1</tspan>')
  expect(gitGraphChart({ operations, direction: 'BT', rotateCommitLabel: true })).toMatch(/transform="rotate\(-45 /)
  expect(gitGraphChart({ operations, rotateCommitLabel: false })).not.toContain('transform="rotate')
  expect(gitGraphChart({ operations, rotateCommitLabel: true, showCommitLabel: false })).not.toContain('diagram-git-label')
})

test('exposes accessible Gantt callback targets and escapes the serialized arguments', () => {
  const svg = ganttChart({ sections: [{ tasks: [
    { name: 'Review notes', id: 'review', start: '2026-03-06', duration: '1d', callback: { name: 'actions.review' } },
    { name: 'Open details', id: 'open', duration: '1d', href: '#details', callback: { name: 'actions.open', args: ['red, blue', '<note>'] } },
    { name: 'Invalid', duration: '1d', callback: { name: 'actions.constructor' } },
  ] }] })!
  expect(svg).toContain('role="group"')
  expect(svg).toContain('role="button" tabindex="0" aria-label="Review notes" data-gantt-callback="actions.review" data-gantt-args="[&quot;review&quot;]"')
  expect(svg).toContain('href="#details" target="_self" aria-label="Open details" data-gantt-callback="actions.open"')
  expect(svg).toContain('[&quot;red, blue&quot;,&quot;&lt;note&gt;&quot;]')
  expect(svg).not.toContain('actions.constructor')
  expect(svg).not.toContain('onclick=')
})

test('paints a Gantt canvas with the selected background in a standalone SVG', () => {
  const chart: GanttChartOptions = {
    title: 'Release',
    sections: [{ tasks: [{ name: 'Draft', start: '2026-01-01', duration: '1d' }] }],
    palette: { background: '#333333', title: '#f9fffe' },
  }
  const svg = ganttChart(chart)!
  expect(svg).toContain('style="--diagram-background:#333333"')
  expect(svg).toMatch(/<rect width="[\d.]+" height="[\d.]+" fill="#333333"\/>/)
  expect(svg).toMatch(/class="diagram-title"[^>]*style="fill:#f9fffe;"/)
  expect(ganttChart({ ...chart, palette: { background: 'red" invalid' } })).not.toContain('--diagram-background')
})

test('renders Gantt geometry, typography, and alternating section colors', () => {
  const chart: GanttChartOptions = {
    title: 'Plan', titleTopMargin: 30, width: 480, leftPadding: 112, fontSize: 16, sectionFontSize: 24,
    gridLineStartPadding: 19, bottomMarginAdj: 12, sectionColors: ['#123456', '#f5c269'],
    tickInterval: '1day', axisFormat: '%L %q %s %Z',
    sections: ['Plan', 'Review', 'Ship'].map(name => ({
      name, tasks: [{ name, start: '2026-01-01', duration: '1d' }],
    })),
  }
  const svg = ganttChart(chart)!
  expect(svg).toContain('viewBox="0 0 480 ')
  expect(svg).toMatch(/y="30" class="diagram-title"/)
  expect(svg).toMatch(/<line class="diagram-gantt-grid"[^>]*y1="19"/)
  expect(svg).toMatch(/class="diagram-gantt-section-label"[^>]*style="font-size:24px;"/)
  expect(svg).toMatch(/class="diagram-gantt-label"[^>]*style="font-size:16px;"/)
  expect(svg.match(/style="fill:#123456;opacity:0.2"/g)).toHaveLength(2)
  expect(svg.match(/style="fill:#f5c269;opacity:0.2"/g)).toHaveLength(1)
  expect(svg).toContain('>000 1 1767225600 +0000</tspan>')
  const heightOf = (html: string) => Number(/viewBox="0 0 \d+ ([\d.]+)"/.exec(html)?.[1])
  expect(heightOf(svg) - heightOf(ganttChart({ ...chart, bottomMarginAdj: 0 })!)).toBe(12)
})

test('keeps dense Gantt grid intervals and shows matching non-overlapping labels on both axes', () => {
  const chart: GanttChartOptions = {
    width: 330, todayMarker: false, topAxis: true, tickInterval: '1day',
    sections: [{ tasks: [{ name: 'Release', start: '2025-12-26', end: '2026-01-05' }] }],
  }
  expect(scheduleGantt(chart)?.axisFormat).toBe('%Y-%m-%d')
  const svg = ganttChart(chart)!
  const axes = [...svg.matchAll(/<g class="diagram-gantt-axis" data-axis="(\w+)"[^>]*>(.*?)<\/g>(?=<g class="diagram-gantt-axis"|<g class="diagram-gantt-task")/gs)]
  expect(axes.map(axis => axis[1])).toEqual(['bottom', 'top'])
  for (const [, , axis] of axes) {
    expect(axis.match(/<line class="diagram-gantt-grid"/g)).toHaveLength(11)
    expect(axis.match(/class="diagram-gantt-tick"/g)!.length).toBeLessThan(11)
    expect(axis).toContain('<title>2026-01-01</title>')
    expect(axis).toMatch(/class="diagram-gantt-tick"[^>]*><tspan[^>]*>2025-12-26<\/tspan>/)
    expect(axis).toMatch(/class="diagram-gantt-tick"[^>]*><tspan[^>]*>2026-01-05<\/tspan>/)
  }
  const overnight = scheduleGantt({
    dateFormat: 'YYYY-MM-DD HH:mm',
    sections: [{ tasks: [{ name: 'Build', start: '2025-12-31 21:00', duration: '5h' }] }],
  })
  expect(overnight?.axisFormat).toBe('%Y-%m-%d %H:%M')
})

test('fits Gantt labels inside bars or puts them on the available side of the task', () => {
  const chart: GanttChartOptions = {
    taskLabelPlacement: 'bar', width: 460, leftPadding: 80, fontSize: 16,
    palette: { insideText: '#223355', statusText: '#113300', outsideText: '#554433' },
    sections: [{ tasks: [
      { name: 'Wide task', id: 'wide', start: '2026-01-01', duration: '8d', tags: ['active'] },
      { name: 'Early short task', id: 'early', start: '2026-01-01', duration: '1h' },
      { name: 'Late short task', id: 'late', start: '2026-01-09', duration: '1h' },
      { name: 'Early milestone', id: 'milestone', start: '2026-01-02', duration: '0d', tags: ['milestone'] },
    ] }],
  }
  const svg = ganttChart(chart)!
  const task = (id: string) => new RegExp(`data-task-id="${id}"[^>]*>(.*?)</g>`).exec(svg)?.[1]
  expect(task('wide')).toMatch(/class="diagram-gantt-label" text-anchor="middle"[^>]*style="fill:#113300;/)
  expect(task('early')).toMatch(/class="diagram-gantt-label" text-anchor="start"[^>]*style="fill:#554433;/)
  expect(task('late')).toMatch(/class="diagram-gantt-label" text-anchor="end"[^>]*style="fill:#554433;/)
  expect(task('milestone')).toContain('text-anchor="start"')
  expect(ganttChart({ ...chart, taskLabelPlacement: 'gutter' })).toMatch(/<text[^>]*x="20"[^>]*class="diagram-gantt-label" text-anchor="start"/)
})

test('wraps complete Gantt labels and retains the width of a narrow fixed chart', () => {
  const name = 'Prepare and review the specification with the delivery team'
  const svg = ganttChart({
    width: 220, leftPadding: 20, rightPadding: 0, wrapTaskLabels: true,
    sections: [{ tasks: [{ name, start: '2026-03-05', duration: '2d' }] }],
  })!
  expect(svg).toContain('viewBox="0 0 220 ')
  const label = /class="diagram-gantt-label"[^>]*>(.*?)<\/text>/.exec(svg)?.[1] ?? ''
  expect(label).not.toContain('…')
  const lines = [...label.matchAll(/<tspan[^>]*>(.*?)<\/tspan>/g)].map(([, line]) => line)
  expect(lines.length).toBeGreaterThan(1)
  expect(lines.join(' ')).toBe(name)
})

test('applies independent GitGraph palettes, label typography, and tag borders', () => {
  const graph: GitGraphOptions = {
    title: 'History', titleTopMargin: 35, rotateCommitLabel: true,
    colors: ['#184454', '#2e6e40'], highlightColors: [undefined, '#e18464'],
    branchLabelColors: ['#a578f2'],
    branchLabelBackgrounds: ['#223344'],
    background: '#efeae5', titleColor: '#563322',
    commitLabel: { color: '#523675', background: '#eee6f1', fontSize: 18 },
    tagLabel: { color: 'black', background: '#fbe7d5', border: '#dc7854', fontSize: 16 },
    operations: [
      { op: 'commit', id: 'draft' }, { op: 'branch', name: 'review' },
      { op: 'commit', id: 'release candidate', style: 'HIGHLIGHT', tags: ['v1'] },
    ],
  }
  const svg = gitGraphChart(graph)!
  expect(svg).toMatch(/y="35" class="diagram-title"/)
  expect(svg).toContain('style="--diagram-background:#efeae5"')
  expect(svg).toMatch(/<rect width="[\d.]+" height="[\d.]+" fill="#efeae5"\/><text[^>]*class="diagram-title"[^>]*style="fill:#563322;"/)
  expect(svg).toContain('stroke="#184454"')
  expect(svg).toMatch(/class="diagram-git-dot"[^>]*fill="#e18464"/)
  expect(svg).toMatch(/class="diagram-git-branch-label"[^>]*style="fill:#a578f2;"/)
  expect(svg).toMatch(/class="diagram-git-branch-label-box"[^>]*fill="#223344"/)
  expect(svg).toMatch(/class="diagram-git-label"[^>]*style="fill:#523675;font-size:18px;"/)
  expect(svg).toMatch(/class="diagram-git-label-box"[^>]*fill="#eee6f1"/)
  expect(svg).toMatch(/class="diagram-git-tag-box"[^>]*fill="#fbe7d5" stroke="#dc7854"/)
  expect(gitGraphChart({ ...graph, tagLabel: { color: 'url(#unsafe)' } })).not.toContain('url(#unsafe)')
})

test('renders GitGraph geometry, branch lines, and independent styles for more than eight lanes', () => {
  const operations: GitGraphOptions['operations'] = [
    { op: 'commit', id: 'root' },
    ...Array.from({ length: 8 }, (_, index) => [
      { op: 'checkout', name: 'main' } as const,
      { op: 'branch', name: `branch${index + 1}` } as const,
    ]).flat(),
    { op: 'commit', id: 'ready', style: 'HIGHLIGHT' },
    { op: 'checkout', name: 'main' },
    { op: 'merge', branch: 'branch8', id: 'released' },
  ]
  const graph: GitGraphOptions = {
    operations, geometry: 'compact', colors: ['#111111', ...Array(7).fill(undefined), '#336699'],
    highlightColors: ['#ff6633', ...Array(7).fill(undefined), '#7666bb'],
    branchLine: { color: '#bdbccc', width: 2, pattern: 'dashed' },
    edgeWidth: 3, branchLabelBorders: Array(9).fill('#765432'), symbolDetailColor: '#dedede',
  }
  const svg = gitGraphChart(graph)!
  const rails = [...svg.matchAll(/<path d="M([\d.]+) [\d.]+H[\d.]+" fill="none" stroke-opacity="1" stroke="#bdbccc" stroke-width="2" stroke-dasharray="4 2"/g)]
  expect(rails).toHaveLength(9)
  expect(new Set(rails.map(([, start]) => start)).size).toBe(1)
  expect(svg).toMatch(/data-commit-id="root"[^>]*>.*?<circle class="diagram-git-dot"[^>]*r="7" fill="#111111"/)
  expect(svg).toMatch(/class="diagram-git-dot"[^>]*width="14" height="14" rx="0" fill="#7666bb"/)
  expect(svg).toMatch(/class="diagram-git-ring" fill="#dedede"[^>]*r="5"/)
  expect(svg).toMatch(/class="diagram-git-branch-label-box"[^>]*rx="0"[^>]*stroke="#765432"/)
  expect(svg).toMatch(/class="diagram-git-edge"[^>]*stroke-width="3" stroke-linecap="round"[^>]*stroke="#336699"/)
})

test('scopes GitGraph gradients and deduplicates label shadow filters', () => {
  const shadow = { color: '#535379', offsetX: 2, offsetY: 3, blur: 1.5, opacity: 0.4 }
  const chart: GitGraphOptions = {
    operations: [{ op: 'commit', tags: ['ready'] }, { op: 'branch', name: 'review' }, { op: 'commit', tags: ['v1'] }],
    branchLabelBackgrounds: ['white', 'white'],
    branchLabelGradient: { start: '#0042eb', end: '#eb0042', width: 3.5 },
    branchLabelShadow: shadow, tagLabelShadow: { ...shadow },
    tagLabel: { shape: 'tag', background: 'white' },
  }
  const svg = gitGraphChart({ ...chart, idPrefix: 'release' })!
  expect(svg.match(/<linearGradient\b/g)).toHaveLength(1)
  expect(svg).toContain('stop-color="#0042eb"')
  expect(svg).toContain('stop-color="#eb0042"')
  expect(svg.match(/<filter\b/g)).toHaveLength(1)
  expect(svg).toContain('dx="2" dy="3" stdDeviation="1.5" flood-color="#535379" flood-opacity="0.4"')
  expect(svg.match(/stroke="url\(#release-branch-label-gradient\)" filter="url\(#release-label-shadow-1\)" stroke-width="3.5"/g)).toHaveLength(2)
  expect(svg.match(/class="diagram-git-tag-box"[^>]*filter="url\(#release-label-shadow-1\)"/g)).toHaveLength(2)

  const other = gitGraphChart({ ...chart, idPrefix: 'review', showBranches: false })!
  expect(other).not.toContain('release-')
  expect(other).not.toContain('linearGradient')
  expect(other).toContain('filter="url(#review-label-shadow-1)"')
  const hidden = gitGraphChart({ ...chart, showBranches: false, tagLabelShadow: { opacity: 0 } })!
  expect(hidden).not.toContain('<defs>')
  const invalid = gitGraphChart({ ...chart, branchLabelGradient: { start: 'url(https://example.invalid)', end: 'red' } })!
  expect(invalid).not.toContain('linearGradient')
})

test('renders branch-only histories and snapshots duplicate commit IDs for cherry-picks', () => {
  const initial = { operations: [], title: 'Release history', mainBranchName: 'stable' }
  expect(buildGitHistory(initial)).toMatchObject({ commits: [], currentBranch: 'stable' })
  expect(gitGraphChart(initial)).toContain('>stable</tspan>')
  const empty = { operations: [{ op: 'branch', name: 'draft' }, { op: 'checkout', name: 'draft' }] } as const
  expect(buildGitHistory(empty)?.commits).toEqual([])
  expect(buildGitHistory(empty)?.currentBranch).toBe('draft')
  expect(gitGraphChart(empty)).toContain('>draft</tspan>')

  const chart: GitGraphOptions = { operations: [
    { op: 'commit', id: 'base' },
    { op: 'branch', name: 'work' },
    { op: 'commit', id: 'revision', message: 'first' },
    { op: 'checkout', name: 'main' },
    { op: 'cherry-pick', commit: 'revision' },
    { op: 'checkout', name: 'work' },
    { op: 'commit', id: 'revision', message: 'second' },
    { op: 'checkout', name: 'main' },
    { op: 'cherry-pick', commit: 'revision' },
  ] }
  expect(buildGitHistory(chart)).toBeUndefined()
  const warn = spyOn(console, 'warn').mockImplementation(() => {})
  try {
    const history = buildGitHistory({ ...chart, duplicateCommitIds: 'latest' })
    expect(warn).toHaveBeenCalledWith('Commit ID revision already exists')
    expect(history?.commits.filter(commit => commit.picked).map(commit => commit.pickedCommit?.message)).toEqual(['first', 'second'])
    expect(buildGitHistory({ duplicateCommitIds: 'latest', operations: [...chart.operations, { op: 'merge', branch: 'work', id: 'revision' }] })).toBeUndefined()
  }
  finally { warn.mockRestore() }
})

test('reserves explicit GitGraph IDs before numbering commits, merges, and cherry-picks', () => {
  const chart: GitGraphOptions = { operations: [
    { op: 'commit' },
    { op: 'branch', name: 'review' },
    { op: 'commit', id: 'c2' },
    { op: 'checkout', name: 'main' },
    { op: 'merge', branch: 'review', id: 'c1' },
    { op: 'commit' },
    { op: 'branch', name: 'maintenance' },
    { op: 'commit' },
    { op: 'checkout', name: 'main' },
    { op: 'cherry-pick', commit: 'c5' },
  ] }
  expect(buildGitHistory(chart)?.commits.map(commit => [commit.id, commit.parents.map(parent => parent.id)])).toEqual([
    ['c3', []], ['c2', ['c3']], ['c1', ['c3', 'c2']], ['c4', ['c1']], ['c5', ['c4']], ['c6', ['c4']],
  ])
  const svg = gitGraphChart(chart)
  expect(svg).toContain('data-commit-id="c1" data-parent-ids="c3, c2"')
  expect(svg).toContain('data-commit-id="c6" data-parent-ids="c4" data-picked-id="c5"')
})

test('includes GitGraph padding in the title position and view box for every direction', () => {
  for (const direction of ['LR', 'TB', 'BT'] as const) {
    const graph: GitGraphOptions = { title: 'Work', direction, operations: [{ op: 'commit', id: 'first' }] }
    const normal = gitGraphChart(graph)!
    const padded = gitGraphChart({ ...graph, diagramPadding: 32 })!
    const size = (svg: string) => /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg)!.slice(1).map(Number)
    expect(size(padded)).toEqual(size(normal).map(value => value + 64))
    expect(padded).toContain('data-diagram-kind="gitgraph" transform="translate(32 32)"')
    expect(padded).toMatch(/y="52" class="diagram-title"/)
  }
})

test('fits multiline GitGraph branch labels and their boxes in each direction', () => {
  for (const direction of ['LR', 'TB', 'BT'] as const) {
    const name = 'Feature A\n  (ongoing)\\nReview next<br>Ready'
    const graph: GitGraphOptions = {
      direction, title: 'Release history', branchLabelBackgrounds: ['#eeeeee', '#aaccff'],
      operations: [
        { op: 'commit', id: 'start' }, { op: 'branch', name }, { op: 'commit', id: 'review' },
        { op: 'checkout', name: 'main' }, { op: 'merge', branch: name },
      ],
    }
    const svg = gitGraphChart(graph)!
    const box = /class="diagram-git-branch-label-box" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*fill="#aaccff"/.exec(svg)!
    const label = /<text[^>]*class="diagram-git-branch-label"[^>]*>((?:<tspan[^>]*>[^<]*<\/tspan>){4})<\/text>/.exec(svg)!
    expect(Array.from(label[1].matchAll(/<tspan[^>]*>([^<]*)/g), match => match[1])).toEqual(['Feature A', '(ongoing)', 'Review next', 'Ready'])
    expect(Number(box[4])).toBe(68)
    expect(Number(box[2])).toBeGreaterThan(20)
    expect(svg).toContain('data-parent-ids="start, review"')
  }
})
