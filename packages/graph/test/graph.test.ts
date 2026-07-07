import type { GraphData } from '../src/index.ts'
import { describe, expect, it } from 'bun:test'
import { createGraphSimulation, graphLayout, networkGraph } from '../src/index.ts'

function sampleData(): GraphData {
  return {
    nodes: [
      { id: 'a', group: 1, value: 10 },
      { id: 'b', group: 1, value: 5 },
      { id: 'c', group: 2, value: 8 },
      { id: 'd', group: 2 },
    ],
    links: [
      { source: 'a', target: 'b', value: 2 },
      { source: 'a', target: 'c', value: 1 },
      { source: 'c', target: 'd' },
    ],
  }
}

describe('graphLayout', () => {
  it('assigns x/y coordinates to every node', () => {
    const data = graphLayout(sampleData())
    for (const node of data.nodes) {
      expect(node.x).toBeTypeOf('number')
      expect(node.y).toBeTypeOf('number')
      expect(Number.isFinite(node.x)).toBe(true)
      expect(Number.isFinite(node.y)).toBe(true)
    }
  })

  it('resolves string link endpoints to node objects', () => {
    const data = graphLayout(sampleData())
    for (const link of data.links) {
      expect((link.source as any).id).toBeTypeOf('string')
      expect((link.target as any).id).toBeTypeOf('string')
    }
  })

  it('keeps linked nodes closer than the layout diagonal', () => {
    const width = 400
    const height = 300
    const data = graphLayout(sampleData(), { width, height, iterations: 200 })
    const [a, b] = [data.nodes[0], data.nodes[1]]
    const distance = Math.hypot(a.x! - b.x!, a.y! - b.y!)
    expect(distance).toBeLessThan(Math.hypot(width, height))
  })

  it('respects fixed node positions', () => {
    const data = sampleData()
    data.nodes[0].fx = 42
    data.nodes[0].fy = 24
    graphLayout(data)
    expect(data.nodes[0].x).toBe(42)
    expect(data.nodes[0].y).toBe(24)
  })
})

describe('createGraphSimulation', () => {
  it('returns a stopped simulation with the standard forces', () => {
    const simulation = createGraphSimulation(sampleData())
    expect(simulation.force('link')).toBeDefined()
    expect(simulation.force('charge')).toBeDefined()
    expect(simulation.force('center')).toBeDefined()
    expect(simulation.force('collide')).toBeDefined()
  })
})

describe('networkGraph', () => {
  it('renders circles and lines into the container', () => {
    const container = document.createElement('div')
    const data = sampleData()
    const handle = networkGraph(container, data, { animated: false, zoomable: false })
    expect(container.querySelectorAll('circle').length).toBe(data.nodes.length)
    expect(container.querySelectorAll('line').length).toBe(data.links.length)
    expect(handle.svg.tagName.toLowerCase()).toBe('svg')
    handle.stop()
  })

  it('positions rendered nodes at their layout coordinates', () => {
    const container = document.createElement('div')
    const data = sampleData()
    networkGraph(container, data, { animated: false, zoomable: false })
    const circles = Array.from(container.querySelectorAll('circle'))
    circles.forEach((circle, i) => {
      expect(Number.parseFloat(circle.getAttribute('cx')!)).toBeCloseTo(data.nodes[i].x!, 3)
      expect(Number.parseFloat(circle.getAttribute('cy')!)).toBeCloseTo(data.nodes[i].y!, 3)
    })
  })

  it('renders labels and applies node styling accessors', () => {
    const container = document.createElement('div')
    const handle = networkGraph(container, sampleData(), {
      animated: false,
      zoomable: false,
      nodeRadius: d => (d.value ?? 1) * 2,
      nodeFill: () => '#123456',
      nodeLabel: d => d.id.toUpperCase(),
    })
    const circles = Array.from(container.querySelectorAll('circle'))
    expect(circles[0].getAttribute('r')).toBe('20')
    expect(circles[0].getAttribute('fill')).toBe('#123456')
    const labels = Array.from(container.querySelectorAll('text')).map(t => t.textContent)
    expect(labels).toEqual(['A', 'B', 'C', 'D'])
    handle.stop()
  })
})
