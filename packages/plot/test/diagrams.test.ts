import { expect, test } from 'bun:test'
import type { GanttChartOptions, GitGraphOptions } from '../src/diagrams.ts'
import { buildGitHistory, flowchartDiagram, ganttChart, gitGraphChart, journeyChart, pieChart, relationshipChart, scheduleGantt, sequenceChart, timelineChart } from '../src/diagrams.ts'

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
    ['root', 0], ['draft', 1], ['prepare', 1], ['release', 2], ['backport', 2],
  ])
  expect(history?.commits[3].parents.map(commit => commit.id)).toEqual(['prepare', 'draft'])
  expect(history?.commits.at(-1)?.picked).toBe('release')
  const svg = gitGraphChart(chart)
  expect(svg).toContain('data-diagram-kind="gitgraph"')
  expect(svg).toContain('aria-label="Project history"')
  expect(svg).toContain('data-commit-id="release" data-parent-ids="prepare, draft"')
  expect(svg).toContain('>Prep work</tspan>')
  expect(svg).toContain('>v1.0</tspan>')
  expect(buildGitHistory({ ...chart, operations: [...chart.operations.slice(0, -1),
    { op: 'cherry-pick', commit: 'release', parent: 'root' },
  ] })).toBeUndefined()
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
  expect(svg.match(/>monday<\/tspan>/g)).toHaveLength(2)
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
