import { expect, test } from 'bun:test'
import { xyChart } from '../src/diagrams.ts'

test('plots grouped positive and negative bars and a labelled line on a category axis', () => {
  const svg = xyChart({
    accessibleTitle: 'Measured totals',
    description: 'Two teams and a benchmark',
    idPrefix: 'metrics',
    title: 'Totals',
    xAxis: { categories: ['Alpha', 'Beta'], title: 'Team' },
    yAxis: { domain: [-10, 10], title: 'Value' },
    series: [
      { type: 'bar', label: 'First', values: [-8, 7] },
      { type: 'bar', color: '#da9269', values: [3, -2] },
      { type: 'line', label: 'Benchmark', values: [{ value: 4, label: 'Target <5' }, 5] },
    ],
    showDataLabel: true,
  })!
  expect(svg).toContain('aria-labelledby="metrics-title" aria-describedby="metrics-description"')
  expect(svg).toContain('data-orientation="vertical"')
  expect(svg).toContain('clip-path="url(#metrics-xy-plot)"')
  expect(svg.match(/class="diagram-xy-bar"/g)).toHaveLength(4)
  expect(svg.match(/class="diagram-xy-value"/g)).toHaveLength(5)
  expect(svg.match(/class="diagram-xy-line"/g)).toHaveLength(1)
  expect(svg).toContain('Target &lt;5')
  expect(svg).toContain('>First</tspan>')
  expect(svg).toContain('>Benchmark</tspan>')
  const rects = [...svg.matchAll(/class="diagram-xy-bar" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"[^>]*data-value="([^"]+)"/g)]
  const [first, , third] = rects.map(values => values.slice(1).map(Number))
  expect(first[0] + first[2]).toBeLessThan(third[0])
  expect(first[1]).toBeCloseTo(third[1] + third[3])
})

test('handles numeric axes, horizontal charts, and imported visual options', () => {
  const svg = xyChart({
    title: 'Measurements', orientation: 'horizontal', width: 640, height: 280,
    colors: ['#abcdef'], backgroundColor: '#123abc', showLegend: false, showTitle: false,
    xAxis: { domain: [10, 30], showTick: false, showTitle: false, title: 'Hidden title' },
    yAxis: { domain: [0, 8], labelFontSize: 18, labelColor: '#ffccaa', labelRotation: -20 },
    series: [{ type: 'line', label: 'Measured', values: [1, 4, { value: 6, label: 'Last' }] }],
  })!
  expect(svg).toContain('viewBox="0 0 640 280"')
  expect(svg).toContain('data-orientation="horizontal"')
  expect(svg).toContain('fill="#123abc"')
  expect(svg).toContain('stroke="#abcdef"')
  expect(svg).toContain('fill:#ffccaa;font-size:18px;')
  expect(svg).toContain('rotate(-20)')
  expect(svg).toContain('>Last</tspan>')
  expect(svg).not.toContain('class="diagram-title"')
  expect(svg).not.toContain('class="diagram-xy-legend"')
  expect(svg).not.toContain('Hidden title')
  expect(svg).not.toMatch(/(?:undefined|NaN|Infinity)/)
})

test('fits one-point and constant charts, limits data to authored categories, and rejects invalid domains', () => {
  const single = xyChart({ series: [{ type: 'line', values: [0] }] })
  expect(single).toContain('data-value="0"')
  expect(single).not.toMatch(/(?:NaN|Infinity)/)
  const clipped = xyChart({ series: [{ type: 'line', values: [2, 2, 1e6] }], xAxis: { categories: ['A', 'B'] } })
  expect(clipped?.match(/data-value=/g)).toHaveLength(2)
  expect(clipped).not.toContain('1000000')
  expect(xyChart({ series: [{ type: 'bar', values: [1] }], yAxis: { domain: [3, 3] } })).toBeUndefined()
  expect(xyChart({ series: [{ type: 'line', values: [NaN] }] })).toBeUndefined()
})
