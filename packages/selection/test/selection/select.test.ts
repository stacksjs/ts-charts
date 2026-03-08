import { describe, it, expect } from 'bun:test'
import { select, selectAll, Selection } from '../../src/index.ts'
import { assertSelection } from '../asserts.ts'

describe('selection.select', () => {
  it('selection.select(...) returns a selection', () => {
    document.body.innerHTML = '<h1>hello</h1>'
    expect(select(document).select('h1') instanceof Selection).toBe(true)
    document.body.innerHTML = ''
  })

  it('selection.select(string) selects the first descendant that matches the selector string for each selected element', () => {
    document.body.innerHTML = '<h1><span id="one"></span><span id="two"></span></h1><h1><span id="three"></span><span id="four"></span></h1>'
    const one = document.querySelector('#one')
    const three = document.querySelector('#three')
    assertSelection(select(document).selectAll('h1').select('span'), { groups: [[one, three]], parents: [document] })
    document.body.innerHTML = ''
  })

  it('selection.select(function) selects the return value of the given function for each selected element', () => {
    document.body.innerHTML = '<span id="one"></span>'
    const one = document.querySelector('#one')
    assertSelection(select(document).select(function () { return one }), { groups: [[one]], parents: [null] })
    document.body.innerHTML = ''
  })

  it('selection.select(function) passes the selector function data, index and group', () => {
    document.body.innerHTML = '<parent id="one"><child id="three"></child><child id="four"></child></parent><parent id="two"><child id="five"></child></parent>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const three = document.querySelector('#three')!
    const four = document.querySelector('#four')!
    const five = document.querySelector('#five')!
    const results: any[] = []

    selectAll([one, two])
      .datum(function (this: any, _d: any, i: number) { return 'parent-' + i })
      .selectAll('child')
      .data(function (_d: any, i: number) { return [0, 1].map(function (j) { return 'child-' + i + '-' + j }) })
      .select(function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]); return null })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })

  it('selection.select(...) propagates data if defined on the originating element', () => {
    document.body.innerHTML = '<parent><child>hello</child></parent>'
    const parent = document.querySelector('parent')! as any
    const child = document.querySelector('child')! as any
    parent.__data__ = 0
    child.__data__ = 42
    select(parent).select('child')
    expect(child.__data__).toBe(0)
    document.body.innerHTML = ''
  })

  it('selection.select(...) will not propagate data if not defined on the originating element', () => {
    document.body.innerHTML = '<parent><child>hello</child></parent>'
    const parent = document.querySelector('parent')!
    const child = document.querySelector('child')! as any
    child.__data__ = 42
    select(parent).select('child')
    expect(child.__data__).toBe(42)
    document.body.innerHTML = ''
  })

  it('selection.select(...) propagates parents from the originating selection', () => {
    document.body.innerHTML = '<parent><child>1</child></parent><parent><child>2</child></parent>'
    const parents = select(document).selectAll('parent')
    const childs = parents.select('child')
    assertSelection(parents, { groups: [document.querySelectorAll('parent')], parents: [document] })
    assertSelection(childs, { groups: [document.querySelectorAll('child')], parents: [document] })
    expect(parents.parents === childs.parents).toBe(true)
    document.body.innerHTML = ''
  })

  it('selection.select(...) can select elements when the originating selection is nested', () => {
    document.body.innerHTML = '<parent id="one"><child><span id="three"></span></child></parent><parent id="two"><child><span id="four"></span></child></parent>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const three = document.querySelector('#three')!
    const four = document.querySelector('#four')!
    assertSelection(selectAll([one, two]).selectAll('child').select('span'), { groups: [[three], [four]], parents: [one, two] })
    document.body.innerHTML = ''
  })

  it('selection.select(...) skips missing originating elements', () => {
    document.body.innerHTML = '<h1><span>hello</span></h1>'
    const h1 = document.querySelector('h1')!
    const span = document.querySelector('span')!
    assertSelection(selectAll([, h1]).select('span'), { groups: [[, span]], parents: [null] })
    document.body.innerHTML = ''
  })

  it('selection.selection() returns itself', () => {
    document.body.innerHTML = '<h1>hello</h1>'
    const sel = select(document).select('h1')
    expect(sel === sel.selection()).toBe(true)
    expect(sel === sel.selection().selection()).toBe(true)
    document.body.innerHTML = ''
  })
})
