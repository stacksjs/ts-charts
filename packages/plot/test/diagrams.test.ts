import { expect, test } from 'bun:test'
import type { GanttChartOptions, GitGraphOptions } from '../src/diagrams.ts'
import { buildGitHistory, flowchartDiagram, ganttChart, gitGraphChart, journeyChart, scheduleGantt, timelineChart } from '../src/diagrams.ts'

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
