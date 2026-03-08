import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.html', () => {
  it('selection.html() returns the inner HTML on the first selected element', () => {
    const node = { innerHTML: 'hello' }
    expect(select(node as any).html()).toBe('hello')
    expect(selectAll([null, node] as any).html()).toBe('hello')
  })

  it('selection.html(value) sets inner HTML on the selected elements', () => {
    const one: any = { innerHTML: '' }
    const two: any = { innerHTML: '' }
    const sel = selectAll([one, two])
    expect(sel.html('bar')).toBe(sel)
    expect(one.innerHTML).toBe('bar')
    expect(two.innerHTML).toBe('bar')
  })

  it('selection.html(null) clears the inner HTML on the selected elements', () => {
    const one: any = { innerHTML: 'bar' }
    const two: any = { innerHTML: 'bar' }
    const sel = selectAll([one, two])
    expect(sel.html(null)).toBe(sel)
    expect(one.innerHTML).toBe('')
    expect(two.innerHTML).toBe('')
  })

  it('selection.html(function) sets the value of the inner HTML on the selected elements', () => {
    const one: any = { innerHTML: 'bar' }
    const two: any = { innerHTML: 'bar' }
    const sel = selectAll([one, two])
    expect(sel.html(function (_d: any, i: number) { return i ? 'baz' : null })).toBe(sel)
    expect(one.innerHTML).toBe('')
    expect(two.innerHTML).toBe('baz')
  })

  it('selection.html(function) passes the value function data, index and group', () => {
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
      .html(function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]); return null })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })
})
