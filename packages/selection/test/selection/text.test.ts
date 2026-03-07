import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.text', () => {
  it('selection.text() returns the text content on the first selected element', () => {
    const node = { textContent: 'hello' }
    expect(select(node as any).text()).toBe('hello')
    expect(selectAll([null, node] as any).text()).toBe('hello')
  })

  it('selection.text(value) sets text content on the selected elements', () => {
    const one: any = { textContent: '' }
    const two: any = { textContent: '' }
    const sel = selectAll([one, two])
    expect(sel.text('bar')).toBe(sel)
    expect(one.textContent).toBe('bar')
    expect(two.textContent).toBe('bar')
  })

  it('selection.text(null) clears the text content on the selected elements', () => {
    const one: any = { textContent: 'bar' }
    const two: any = { textContent: 'bar' }
    const sel = selectAll([one, two])
    expect(sel.text(null)).toBe(sel)
    expect(one.textContent).toBe('')
    expect(two.textContent).toBe('')
  })

  it('selection.text(function) sets the value of the text content on the selected elements', () => {
    const one: any = { textContent: 'bar' }
    const two: any = { textContent: 'bar' }
    const sel = selectAll([one, two])
    expect(sel.text(function (_d: any, i: number) { return i ? 'baz' : null })).toBe(sel)
    expect(one.textContent).toBe('')
    expect(two.textContent).toBe('baz')
  })

  it('selection.text(function) passes the value function data, index and group', () => {
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
      .text(function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]) })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })
})
