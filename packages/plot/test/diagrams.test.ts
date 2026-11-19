import { expect, test } from 'bun:test'
import { flowchartDiagram, journeyChart, timelineChart } from '../src/diagrams.ts'

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
