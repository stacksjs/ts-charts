import type { LayeredGraph, LayeredLayoutResult } from '../src/index.ts'
import { describe, expect, it } from 'bun:test'
import { edgePath, layeredLayout } from '../src/index.ts'

/** A small pipeline: one source fanning into two branches that rejoin. */
function pipeline(): LayeredGraph {
  return {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
      { source: 'b', target: 'd' },
      { source: 'c', target: 'd' },
    ],
  }
}

function nodeById(result: LayeredLayoutResult, id: string) {
  const node = result.nodes.find((candidate) => candidate.id === id)
  if (!node) throw new Error(`missing node ${id}`)
  return node
}

describe('layeredLayout', () => {
  it('ranks every node one layer below its deepest predecessor', () => {
    const result = layeredLayout(pipeline())
    expect(nodeById(result, 'a').layer).toBe(0)
    expect(nodeById(result, 'b').layer).toBe(1)
    expect(nodeById(result, 'c').layer).toBe(1)
    expect(nodeById(result, 'd').layer).toBe(2)
  })

  it('places later layers further down for the default direction', () => {
    const result = layeredLayout(pipeline())
    expect(nodeById(result, 'a').y).toBeLessThan(nodeById(result, 'b').y)
    expect(nodeById(result, 'b').y).toBeLessThan(nodeById(result, 'd').y)
    expect(nodeById(result, 'b').y).toBe(nodeById(result, 'c').y)
  })

  it('keeps nodes in a layer apart by at least the node gap', () => {
    const result = layeredLayout(pipeline(), { nodeGap: 40 })
    const b = nodeById(result, 'b')
    const c = nodeById(result, 'c')
    const [left, right] = b.x <= c.x ? [b, c] : [c, b]
    expect(right.x - (left.x + left.width)).toBeGreaterThanOrEqual(40 - 0.001)
  })

  it('honours per-node box sizes', () => {
    const result = layeredLayout({
      nodes: [{ id: 'a', width: 240, height: 90 }, { id: 'b' }],
      edges: [{ source: 'a', target: 'b' }],
    })
    expect(nodeById(result, 'a').width).toBe(240)
    expect(nodeById(result, 'a').height).toBe(90)
  })

  it('lays out left-to-right when asked', () => {
    const result = layeredLayout(pipeline(), { direction: 'right' })
    expect(nodeById(result, 'a').x).toBeLessThan(nodeById(result, 'b').x)
    expect(nodeById(result, 'b').x).toBe(nodeById(result, 'c').x)
  })

  it('reverses the layer axis for up and left', () => {
    const down = layeredLayout(pipeline())
    const up = layeredLayout(pipeline(), { direction: 'up' })
    expect(nodeById(up, 'a').y).toBeGreaterThan(nodeById(up, 'd').y)
    expect(up.height).toBe(down.height)
  })

  it('respects explicit layers', () => {
    const result = layeredLayout({
      nodes: [{ id: 'a' }, { id: 'b', layer: 3 }],
      edges: [{ source: 'a', target: 'b' }],
    })
    expect(nodeById(result, 'b').layer).toBe(3)
    expect(result.layers).toHaveLength(4)
  })

  it('bends edges that span more than one layer', () => {
    const result = layeredLayout({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'skip', layer: 0 }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'a', target: 'c' },
      ],
    })
    const long = result.edges.find((edge) => edge.source === 'a' && edge.target === 'c')!
    expect(long.points.length).toBe(3)
  })

  it('terminates on a cycle and reports the caller direction', () => {
    const result = layeredLayout({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'a' },
      ],
    })
    const back = result.edges.find((edge) => edge.source === 'c' && edge.target === 'a')!
    expect(back.reversed).toBe(true)
    expect(result.nodes).toHaveLength(3)
  })

  it('marks same-layer edges as flat', () => {
    const result = layeredLayout({
      nodes: [{ id: 'a', layer: 0 }, { id: 'b', layer: 0 }],
      edges: [{ source: 'a', target: 'b' }],
    })
    expect(result.edges[0].flat).toBe(true)
    expect(result.edges[0].points).toHaveLength(2)
  })

  it('drops edges pointing at unknown nodes instead of throwing', () => {
    const result = layeredLayout({
      nodes: [{ id: 'a' }],
      edges: [{ source: 'a', target: 'ghost' }],
    })
    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(0)
  })

  it('ignores self loops', () => {
    const result = layeredLayout({ nodes: [{ id: 'a' }], edges: [{ source: 'a', target: 'a' }] })
    expect(nodeById(result, 'a').layer).toBe(0)
  })

  it('handles an empty graph', () => {
    const result = layeredLayout({ nodes: [], edges: [] })
    expect(result.nodes).toHaveLength(0)
    expect(result.width).toBeGreaterThan(0)
  })

  it('orders layers to avoid crossings on a graph that has a planar order', () => {
    // Two independent chains: any crossing here would be the ordering's fault.
    const result = layeredLayout({
      nodes: [{ id: 'a1' }, { id: 'a2' }, { id: 'b1' }, { id: 'b2' }],
      edges: [
        { source: 'a1', target: 'a2' },
        { source: 'b1', target: 'b2' },
      ],
    })
    expect(result.crossings).toBe(0)
  })

  it('reduces crossings on a deliberately tangled graph', () => {
    const result = layeredLayout({
      nodes: [{ id: 's1' }, { id: 's2' }, { id: 's3' }, { id: 't1' }, { id: 't2' }, { id: 't3' }],
      edges: [
        { source: 's1', target: 't3' },
        { source: 's2', target: 't2' },
        { source: 's3', target: 't1' },
      ],
    })
    expect(result.crossings).toBe(0)
  })

  it('reports a drawing large enough to contain every node', () => {
    const result = layeredLayout(pipeline(), { padding: 30 })
    for (const node of result.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeGreaterThanOrEqual(0)
      expect(node.x + node.width).toBeLessThanOrEqual(result.width + 0.001)
      expect(node.y + node.height).toBeLessThanOrEqual(result.height + 0.001)
    }
  })

  it('groups node ids per layer band', () => {
    const result = layeredLayout(pipeline())
    expect(result.layers[1].nodes.sort()).toEqual(['b', 'c'])
    expect(result.layers[1].width).toBeGreaterThan(0)
  })
})

describe('edgePath', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 40, y: 100 },
  ]

  it('returns an empty string for a degenerate edge', () => {
    expect(edgePath([])).toBe('')
    expect(edgePath([{ x: 1, y: 1 }])).toBe('')
  })

  it('joins points directly for the linear curve', () => {
    expect(edgePath(points, { curve: 'linear' })).toBe('M0,0L40,100')
  })

  it('emits cubic segments for the smooth curve', () => {
    const path = edgePath(points, { curve: 'smooth' })
    expect(path.startsWith('M0,0C')).toBe(true)
    expect(path.endsWith('40,100')).toBe(true)
  })

  it('emits rounded corners for the orthogonal curve', () => {
    const path = edgePath(points, { curve: 'orthogonal' })
    expect(path).toContain('Q')
    expect(path.endsWith('40,100')).toBe(true)
  })

  it('bends along the x axis for horizontal directions', () => {
    const vertical = edgePath(points, { curve: 'smooth' })
    const horizontal = edgePath(points, { curve: 'smooth', direction: 'right' })
    expect(horizontal).not.toBe(vertical)
  })

  it('produces a path that survives a round trip through every routed edge', () => {
    const result = layeredLayout(pipeline())
    for (const edge of result.edges) expect(edgePath(edge.points).startsWith('M')).toBe(true)
  })
})
