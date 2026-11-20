import { expect, test } from 'bun:test'
import { layoutSankey, sankeyChart } from '../src/diagrams.ts'

const links = [
  { source: 'Solar', target: 'Grid', value: 25 },
  { source: 'Wind', target: 'Grid', value: 15 },
  { source: 'Solar', target: 'Direct use', value: 5 },
  { source: 'Grid', target: 'Homes', value: 30 },
  { source: 'Grid', target: 'Industry', value: 10 },
]

test('preserves relative link widths and packs incoming and outgoing flows inside a node', () => {
  const graph = layoutSankey({ links })!
  const [solar, wind, direct] = graph.links
  expect(solar.width / direct.width).toBeCloseTo(5)
  expect(solar.width / wind.width).toBeCloseTo(25 / 15)
  const balance = graph.nodes.find(node => node.id === 'Grid')!
  expect(balance.value).toBe(40)
  expect(balance.height).toBeCloseTo(solar.width + wind.width)
  expect(graph.links.every(({ source, target }) => target.x > source.x + graph.nodeWidth)).toBe(true)
  for (const link of graph.links) {
    for (const [port, node] of [[link.sourceY, link.source], [link.targetY, link.target]] as const) {
      expect(port - link.width / 2).toBeGreaterThanOrEqual(node.y - 1e-8)
      expect(port + link.width / 2).toBeLessThanOrEqual(node.y + node.height + 1e-8)
    }
  }
  expect(() => JSON.stringify(graph)).not.toThrow()
  expect(layoutSankey({ links })).toEqual(graph)
})

test('lays out sinks and independent sources according to all four alignments', () => {
  const edges = [...links, { source: 'Backup', target: 'Industry', value: 3 }]
  const layer = (alignment: 'justify' | 'left' | 'right' | 'center', id: string) =>
    layoutSankey({ links: edges, nodeAlignment: alignment })?.nodes.find(node => node.id === id)?.layer
  expect(layer('justify', 'Direct use')).toBe(2)
  expect(layer('left', 'Direct use')).toBe(1)
  expect(layer('right', 'Backup')).toBe(1)
  expect(layer('center', 'Backup')).toBe(1)
  expect(layer('justify', 'Backup')).toBe(0)
  expect(layer('center', 'Wind')).toBe(0)
})

test('renders gradients, safe custom paints and accessible labels in a standalone SVG', () => {
  const svg = sankeyChart({
    idPrefix: 'energy', title: 'Allocation', accessibleTitle: 'Flow totals',
    description: 'Energy travels from source to destination.',
    links, nodeColors: { Grid: 'rgb(40 90 120)', Solar: '#aabbcc' },
    labelStyle: 'outlined', prefix: '<', suffix: ' kWh', useMaxWidth: false, width: 780, height: 380,
  })!
  expect(svg).toContain('width="780" height="380"')
  expect(svg).toContain('aria-labelledby="energy-title" aria-describedby="energy-description"')
  expect(svg).toContain('id="energy-sankey-0" gradientUnits="userSpaceOnUse"')
  expect(svg).toContain('stop-color="rgb(40 90 120)"')
  expect(svg).toContain('stop-color="#aabbcc"')
  expect(svg).toContain('&lt;40 kWh')
  expect(svg).toContain('paint-order="stroke fill"')
  expect(svg).toContain('Solar → Grid: 25')
  const solid = sankeyChart({ links, linkColor: 'target', nodeColors: { Grid: '#1a2b3c' }, showValues: false })!
  expect(solid).not.toContain('<linearGradient')
  expect(solid).toMatch(/data-target="Grid"[^>]*stroke="#1a2b3c"/)
  expect(solid).not.toContain('>40</tspan>')
})

test('rejects circular and invalid flows and escapes structured chart identifiers', () => {
  expect(sankeyChart({ links: [...links, { source: 'Grid', target: 'Solar', value: 1 }] })).toBeUndefined()
  expect(sankeyChart({ links: [{ source: 'A', target: 'B', value: -4 }] })).toBeUndefined()
  const svg = sankeyChart({
    links: [{ source: '<script>', target: '"Flood"', value: 0.001 }],
    nodeColors: { '<script>': 'url(javascript:bad)' },
    nodeAlignment: 'bad" onclick="bad' as never,
  })!
  expect(svg).toContain('data-source="&lt;script&gt;" data-target="&quot;Flood&quot;"')
  expect(svg).not.toContain('javascript:')
  expect(svg).not.toContain('onclick=')
  expect(svg).toContain('data-alignment="justify"')
})
