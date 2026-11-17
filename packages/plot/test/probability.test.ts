import { describe, expect, it } from 'bun:test'
import { probabilityChart, resolveLabelPositions } from '../src/index.ts'

const lakers: Array<[number, number]> = [[0, 0.78], [10, 0.76], [20, 0.74], [30, 0.73]]
const hornets: Array<[number, number]> = [[0, 0.22], [10, 0.24], [20, 0.26], [30, 0.27]]

function chart(overrides: Partial<Parameters<typeof probabilityChart>[0]> = {}) {
  return probabilityChart({
    width: 720,
    height: 320,
    series: [
      { id: 'lal', label: 'LAL', color: '#552583', points: lakers },
      { id: 'cha', label: 'CHA', color: '#1d1160', points: hornets },
    ],
    ...overrides,
  })
}

describe('probabilityChart', () => {
  it('renders an accessible SVG at the size asked for', () => {
    const { svg, width, height } = chart({ title: 'CHA at LAL' })
    expect(width).toBe(720)
    expect(height).toBe(320)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('width="720" height="320"')
    expect(svg).toContain('role="img"')
    expect(svg).toContain('<title>CHA at LAL: LAL 73%, CHA 27%</title>')
  })

  it('draws one line, one fill and one dot per series', () => {
    const { svg } = chart()
    expect(svg.match(/stroke="#552583"/g)?.length).toBe(1)
    expect(svg.match(/<linearGradient/g)?.length).toBe(2)
    expect(svg.match(/<circle/g)?.length).toBe(4)
  })

  it('labels each series with its latest value', () => {
    const { labels, svg } = chart()
    expect(labels.map(label => [label.label, label.text])).toEqual([['LAL', '73%'], ['CHA', '27%']])
    expect(svg).toContain('>73%</text>')
  })

  it('puts the higher probability label above the lower', () => {
    const { labels } = chart()
    expect(labels[0]!.y).toBeLessThan(labels[1]!.y)
  })

  it('keeps labels apart when prices are close', () => {
    const { labels } = chart({
      series: [
        { id: 'a', label: 'A', color: 'red', points: [[0, 0.5], [1, 0.51]] },
        { id: 'b', label: 'B', color: 'blue', points: [[0, 0.5], [1, 0.49]] },
      ],
    })
    expect(Math.abs(labels[0]!.y - labels[1]!.y)).toBeGreaterThanOrEqual(46)
  })

  it('holds the last value out to the present', () => {
    const { svg } = chart({ domain: [0, 60], extendTo: 60 })
    // The step line ends at the right edge of the plot, not at t=30.
    const right = 720 - 120 - 16
    expect(svg).toContain(`cx="${right}"`)
  })

  it('omits labels when there is no room reserved for them', () => {
    const { svg } = chart({ labelWidth: 0 })
    expect(svg).not.toContain('<text')
  })

  it('escapes labels and colours', () => {
    const { svg } = chart({
      series: [{ id: 'x', label: '<b>&', color: '"red"', points: [[0, 0.4], [1, 0.6]] }],
    })
    expect(svg).toContain('&lt;b&gt;&amp;')
    expect(svg).toContain('&quot;red&quot;')
    expect(svg).not.toContain('<b>')
  })

  it('skips empty series and survives no data', () => {
    const { svg, labels } = chart({ series: [{ id: 'e', label: 'E', color: 'red', points: [] }] })
    expect(labels).toEqual([])
    expect(svg).toContain('<svg')
  })

  it('draws dashed grid lines where asked', () => {
    const { svg } = chart({ grid: [0.25, 0.5, 0.75] })
    expect(svg.match(/stroke-dasharray/g)?.length).toBe(3)
  })
})

describe('resolveLabelPositions', () => {
  it('leaves labels that do not collide where they are', () => {
    expect(resolveLabelPositions([40, 200], 50, 0, 300)).toEqual([40, 200])
  })

  it('pushes colliding labels apart, keeping their order', () => {
    const [a, b] = resolveLabelPositions([100, 110], 50, 0, 300)
    expect(b! - a!).toBe(50)
    expect(a).toBe(100)
  })

  it('pushes the stack back up from the bottom', () => {
    const [a, b] = resolveLabelPositions([290, 295], 50, 0, 300)
    expect(b).toBe(300)
    expect(a).toBe(250)
  })

  it('works whatever order the labels arrive in', () => {
    const [a, b] = resolveLabelPositions([110, 100], 50, 0, 300)
    expect(a! - b!).toBe(50)
  })
})
