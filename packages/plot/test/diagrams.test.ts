import { expect, test } from 'bun:test'
import type { GanttChartOptions, GitGraphOptions } from '../src/diagrams.ts'
import { buildGitHistory, flowchartDiagram, ganttChart, ganttDateParser, gitGraphChart, journeyChart, pieChart, relationshipChart, scheduleGantt, sequenceChart, timelineChart } from '../src/diagrams.ts'
import { ganttTicks } from '../src/gantt-time.ts'

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
  expect(svg).toContain('data-task-end="2026-03-09T00:00:00.000Z" data-task-bar-end="2026-03-07T00:00:00.000Z"')
  const bars = [...svg.matchAll(/class="diagram-gantt-bar"[^>]* x="([\d.]+)"[^>]* width="([\d.]+)"/g)]
    .map(([, x, width]) => ({ x: Number(x), width: Number(width) }))
  expect(bars).toHaveLength(3)
  expect(bars[1].x - (bars[0].x + bars[0].width)).toBeCloseTo(bars[0].width * 2)
  expect(bars[1].width).toBeCloseTo(bars[0].width * 3)
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
  const svg = gitGraphChart(chart)
  expect(svg).toContain('data-diagram-kind="gitgraph"')
  expect(svg).toContain('aria-label="Project history"')
  expect(svg).toContain('data-commit-id="release" data-parent-ids="prepare, draft"')
  expect(svg).toContain('>Prep work</tspan>')
  expect(svg).toContain('>v1.0</tspan>')
  expect(svg).toContain('data-commit-id="backport" data-parent-ids="draft" data-picked-id="release" data-picked-parent="draft"')
  expect(svg).toMatch(/class="diagram-git-edge diagram-git-pick-edge"[^>]*stroke-dasharray="5 3" data-from-commit="release" data-to-commit="backport"/)
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
  expect(svg).toMatch(/class="diagram-gantt-grid"[^>]*d="M[\d.]+ 19V/)
  expect(svg).toMatch(/class="diagram-gantt-section-label"[^>]*style="font-size:24px;"/)
  expect(svg).toMatch(/class="diagram-gantt-label"[^>]*style="font-size:16px;"/)
  expect(svg.match(/style="fill:#123456;opacity:0.2"/g)).toHaveLength(2)
  expect(svg.match(/style="fill:#f5c269;opacity:0.2"/g)).toHaveLength(1)
  expect(svg).toContain('>000 1 1767225600 +0000</tspan>')
  const heightOf = (html: string) => Number(/viewBox="0 0 \d+ ([\d.]+)"/.exec(html)?.[1])
  expect(heightOf(svg) - heightOf(ganttChart({ ...chart, bottomMarginAdj: 0 })!)).toBe(12)
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
