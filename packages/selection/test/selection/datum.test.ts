import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.datum', () => {
  it('selection.datum() returns the datum on the first selected element', () => {
    const node = { __data__: 'hello' }
    expect(select(node as any).datum()).toBe('hello')
    expect(selectAll([null, node] as any).datum()).toBe('hello')
  })

  it('selection.datum(value) sets datum on the selected elements', () => {
    const one: any = { __data__: '' }
    const two: any = { __data__: '' }
    const sel = selectAll([one, two])
    expect(sel.datum('bar')).toBe(sel)
    expect(one.__data__).toBe('bar')
    expect(two.__data__).toBe('bar')
  })

  it('selection.datum(null) clears the datum on the selected elements', () => {
    const one: any = { __data__: 'bar' }
    const two: any = { __data__: 'bar' }
    const sel = selectAll([one, two])
    expect(sel.datum(null)).toBe(sel)
    expect('__data__' in one).toBe(false)
    expect('__data__' in two).toBe(false)
  })

  it('selection.datum(function) sets the value of the datum on the selected elements', () => {
    const one: any = { __data__: 'bar' }
    const two: any = { __data__: 'bar' }
    const sel = selectAll([one, two])
    expect(sel.datum((_d: any, i: number) => i ? 'baz' : null)).toBe(sel)
    expect('__data__' in one).toBe(false)
    expect(two.__data__).toBe('baz')
  })

  it('selection.datum(function) passes the value function data, index and group', () => {
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
      .datum(function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]) })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })
})
