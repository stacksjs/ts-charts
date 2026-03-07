import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.classed', () => {
  it('selection.classed(classes) returns true if and only if the first element has the specified classes', () => {
    document.body.innerHTML = '<h1 class="c1 c2">hello</h1><h1 class="c3"></h1>'
    expect(select(document).select('h1').classed('')).toBe(true)
    expect(select(document).select('h1').classed('c1')).toBe(true)
    expect(select(document).select('h1').classed('c2')).toBe(true)
    expect(select(document).select('h1').classed('c3')).toBe(false)
    expect(select(document).select('h1').classed('c1 c2')).toBe(true)
    expect(select(document).select('h1').classed('c2 c1')).toBe(true)
    expect(select(document).select('h1').classed('c1 c3')).toBe(false)
    expect(selectAll([null, document]).select('h1').classed('c1')).toBe(true)
    expect(selectAll([null, document]).select('h1').classed('c2')).toBe(true)
    expect(selectAll([null, document]).select('h1').classed('c3')).toBe(false)
    document.body.innerHTML = ''
  })

  it('selection.classed(classes, value) sets whether the selected elements have the specified classes', () => {
    const s = select(document.body)
    expect(s.classed('c1')).toBe(false)
    expect(s.classed('c1', true)).toBe(s)
    expect(s.classed('c1')).toBe(true)
    expect(s.classed('c1 c2', true)).toBe(s)
    expect(s.classed('c1')).toBe(true)
    expect(s.classed('c2')).toBe(true)
    expect(s.classed('c1 c2')).toBe(true)
    expect(s.classed('c1', false)).toBe(s)
    expect(s.classed('c1')).toBe(false)
    expect(s.classed('c2')).toBe(true)
    expect(s.classed('c1 c2')).toBe(false)
    expect(s.classed('c1 c2', false)).toBe(s)
    expect(s.classed('c1')).toBe(false)
    expect(s.classed('c2')).toBe(false)
    document.body.className = ''
  })

  it('selection.classed(classes, function) sets whether the selected elements have the specified classes', () => {
    const s = select(document.body)
    expect(s.classed('c1 c2', () => true)).toBe(s)
    expect(s.attr('class')).toBe('c1 c2')
    expect(s.classed('c1 c2', () => false)).toBe(s)
    // happy-dom returns null for empty class attribute; browsers return ''
    expect(s.attr('class') || '').toBe('')
    document.body.className = ''
  })

  it('selection.classed(classes, function) passes the value function data, index and group', () => {
    document.body.innerHTML = '<parent id="one"><child id="three"></child><child id="four"></child></parent><parent id="two"><child id="five"></child></parent>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const three = document.querySelector('#three')!
    const four = document.querySelector('#four')!
    const five = document.querySelector('#five')!
    const results: any[] = []

    selectAll([one, two])
      .datum(function (_d: any, i: number) { return 'parent-' + i })
      .selectAll('child')
      .data(function (_d: any, i: number) { return [0, 1].map(function (j) { return 'child-' + i + '-' + j }) })
      .classed('c1 c2', function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]) })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })
})
