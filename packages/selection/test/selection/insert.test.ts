import { describe, it, expect } from 'bun:test'
import { selectAll } from '../../src/index.ts'
import { assertSelection } from '../asserts.ts'

describe('selection.insert', () => {
  it('selection.insert(name, before) inserts a new element of the specified name before the specified child of each selected element', () => {
    document.body.innerHTML = '<div id="one"><span class="before"></span></div><div id="two"><span class="before"></span></div>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).insert('span', '.before')
    const three = one.querySelector('span:first-child')!
    const four = two.querySelector('span:first-child')!
    assertSelection(sel, { groups: [[three, four]], parents: [null] })
    document.body.innerHTML = ''
  })

  it('selection.insert(function, function) inserts the returned element before the specified child of each selected element', () => {
    document.body.innerHTML = '<div id="one"><span class="before"></span></div><div id="two"><span class="before"></span></div>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).insert(function () { return document.createElement('SPAN') }, function (this: any) { return this.firstChild })
    const three = one.querySelector('span:first-child')!
    const four = two.querySelector('span:first-child')!
    assertSelection(sel, { groups: [[three, four]], parents: [null] })
    document.body.innerHTML = ''
  })

  it('selection.insert(function, function) inserts the returned element as the last child if the selector function returns null', () => {
    document.body.innerHTML = '<div id="one"><span class="before"></span></div><div id="two"><span class="before"></span></div>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).insert(function () { return document.createElement('SPAN') }, function () { return null })
    const three = one.querySelector('span:last-child')!
    const four = two.querySelector('span:last-child')!
    assertSelection(sel, { groups: [[three, four]], parents: [null] })
    document.body.innerHTML = ''
  })

  it('selection.insert(name, function) passes the selector function data, index and group', () => {
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
      .insert('span', function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]); return null })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })
})
