import { describe, it, expect } from 'bun:test'
import { select, selectAll, Selection } from '../../src/index.ts'
import { assertSelection } from '../asserts.ts'

describe('selection.selectAll', () => {
  it('selection.selectAll(...) returns a selection', () => {
    document.body.innerHTML = '<h1>hello</h1>'
    expect(select(document).selectAll('h1') instanceof Selection).toBe(true)
    document.body.innerHTML = ''
  })

  it('selection.selectAll(string) selects all descendants that match the selector string for each selected element', () => {
    document.body.innerHTML = '<h1 id="one"><span></span><span></span></h1><h1 id="two"><span></span><span></span></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    assertSelection(selectAll([one, two]).selectAll('span'), { groups: [one.querySelectorAll('span'), two.querySelectorAll('span')], parents: [one, two] })
    document.body.innerHTML = ''
  })

  it('selection.selectAll(function) selects the return values of the given function for each selected element', () => {
    document.body.innerHTML = '<span id="one"></span>'
    const one = document.querySelector('#one')!
    assertSelection(select(document).selectAll(function () { return [one] }), { groups: [[one]], parents: [document] })
    document.body.innerHTML = ''
  })

  it('selection.selectAll(function) passes the selector function data, index and group', () => {
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
      .selectAll(function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]); return [] })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })

  it('selection.selectAll(...) will not propagate data', () => {
    document.body.innerHTML = '<parent><child>hello</child></parent>'
    const parent = document.querySelector('parent')! as any
    const child = document.querySelector('child')! as any
    parent.__data__ = 42
    select(parent).selectAll('child')
    expect(!('__data__' in child)).toBe(true)
    document.body.innerHTML = ''
  })

  it('selection.selectAll(...) groups selected elements by their parent in the originating selection', () => {
    document.body.innerHTML = '<parent id="one"><child id="three"></child></parent><parent id="two"><child id="four"></child></parent>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const three = document.querySelector('#three')!
    const four = document.querySelector('#four')!
    assertSelection(select(document).selectAll('parent').selectAll('child'), { groups: [[three], [four]], parents: [one, two] })
    assertSelection(select(document).selectAll('child'), { groups: [[three, four]], parents: [document] })
    document.body.innerHTML = ''
  })

  it('selection.selectAll(...) skips missing originating elements', () => {
    document.body.innerHTML = '<h1><span>hello</span></h1>'
    const h1 = document.querySelector('h1')!
    const span = document.querySelector('span')!
    assertSelection(selectAll([, h1]).selectAll('span'), { groups: [[span]], parents: [h1] })
    document.body.innerHTML = ''
  })
})
