import { describe, it, expect } from 'bun:test'
import { scaleLinear } from '@ts-charts/scale'
import { select } from '@ts-charts/selection'
import { axisLeft } from '../src/index.ts'

describe('axis snapshots', () => {
  it('axisLeftScaleLinear', () => {
    const svg = document.createElement('svg')
    select(svg).append('g').call(axisLeft(scaleLinear()))
    const html = svg.outerHTML

    // Should contain the domain path
    expect(html).toContain('class="domain"')
    expect(html).toContain('stroke="currentColor"')

    // Should contain tick groups
    expect(html).toContain('class="tick"')

    // Should have 11 ticks (0.0 through 1.0 in 0.1 increments)
    const tickMatches = html.match(/class="tick"/g)
    expect(tickMatches).not.toBeNull()
    expect(tickMatches!.length).toBe(11)

    // Should contain tick labels from 0.0 to 1.0
    expect(html).toContain('0.0')
    expect(html).toContain('0.5')
    expect(html).toContain('1.0')

    // Should have tick lines
    expect(html).toContain('<line')
    expect(html).toContain('x2="-6"')

    // Should have text elements with proper positioning
    expect(html).toContain('<text')
    expect(html).toContain('fill="currentColor"')
    expect(html).toContain('x="-9"')
    expect(html).toContain('dy="0.32em"')

    // Domain path should match expected pattern (small range since default is [0,1])
    expect(html).toContain('M-6,')
    expect(html).toContain('H0.5')

    // Axis should use left orientation attributes
    expect(html).toContain('text-anchor="end"')
    expect(html).toContain('font-size="10"')
    expect(html).toContain('font-family="sans-serif"')
  })

  it('axisLeftScaleLinearNonNumericRange', () => {
    const svg = document.createElement('svg')
    select(svg).append('g').call(axisLeft(scaleLinear().range([0, '500'] as any)))
    const html = svg.outerHTML

    // Should contain the domain path
    expect(html).toContain('class="domain"')

    // Domain path should span from 0 to 500 (non-numeric range coerced)
    expect(html).toContain('M-6,0.5H0.5V500.5H-6')

    // Should contain 11 ticks
    const tickMatches = html.match(/class="tick"/g)
    expect(tickMatches).not.toBeNull()
    expect(tickMatches!.length).toBe(11)

    // Should contain tick labels
    expect(html).toContain('0.0')
    expect(html).toContain('0.5')
    expect(html).toContain('1.0')

    // Ticks should be at proper positions (50px apart for range [0,500])
    expect(html).toContain('translate(0,0.5)')
    expect(html).toContain('translate(0,50.5)')
    expect(html).toContain('translate(0,100.5)')
    expect(html).toContain('translate(0,250.5)')
    expect(html).toContain('translate(0,500.5)')

    // Should have proper axis structure
    expect(html).toContain('text-anchor="end"')
    expect(html).toContain('font-size="10"')
  })
})
