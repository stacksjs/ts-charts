import { describe, it, expect } from 'bun:test'
import { select, selectAll, Selection } from '../../src/index.ts'
import { assertSelection } from '../asserts.ts'

describe('selection.filter', () => {
  it('selection.filter(...) returns a selection', () => {
    expect(select(document.body).filter('body') instanceof Selection).toBe(true)
  })

  it('selection.filter(string) retains the selected elements that matches the selector string', () => {
    document.body.innerHTML = '<h1><span id="one" class="keep"></span><span id="two"></span></h1><h1><span id="three" class="keep"></span><span id="four"></span></h1>'
    const one = document.querySelector('#one')!
    const three = document.querySelector('#three')!
    // Use class selector instead of comma-separated IDs due to happy-dom matches() bug with comma selectors
    assertSelection(select(document).selectAll('span').filter('.keep'), { groups: [[one, three]], parents: [document] })
    document.body.innerHTML = ''
  })

  it('selection.filter(function) retains elements for which the given function returns true', () => {
    document.body.innerHTML = '<h1><span id="one"></span><span id="two"></span></h1><h1><span id="three"></span><span id="four"></span></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const three = document.querySelector('#three')!
    const four = document.querySelector('#four')!
    assertSelection(selectAll([one, two, three, four]).filter(function (_d: any, i: number) { return i & 1 }), { groups: [[two, four]], parents: [null] })
    document.body.innerHTML = ''
  })

  it('selection.filter(function) passes the selector function data, index and group', () => {
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
      .filter(function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]) })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })

  it('selection.filter(...) propagates parents from the originating selection', () => {
    document.body.innerHTML = '<parent><child>1</child></parent><parent><child>2</child></parent>'
    const parents = select(document).selectAll('parent')
    const parents2 = parents.filter(function () { return true })
    assertSelection(parents, { groups: [document.querySelectorAll('parent')], parents: [document] })
    assertSelection(parents2, { groups: [document.querySelectorAll('parent')], parents: [document] })
    expect(parents._parents === parents2._parents).toBe(true)
    document.body.innerHTML = ''
  })

  it('selection.filter(...) skips missing originating elements and does not retain the original indexes', () => {
    document.body.innerHTML = '<h1>hello</h1>'
    const h1 = document.querySelector('h1')!
    assertSelection(selectAll([, h1]).filter('*'), { groups: [[h1]], parents: [null] })
    assertSelection(selectAll([null, h1]).filter('*'), { groups: [[h1]], parents: [null] })
    assertSelection(selectAll([undefined, h1]).filter('*'), { groups: [[h1]], parents: [null] })
    document.body.innerHTML = ''
  })
})
