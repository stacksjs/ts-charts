import { describe, it, expect } from 'bun:test'
import { namespaces, select, selectAll, Selection } from '../../src/index.ts'
import { assertSelection } from '../asserts.ts'

const supportsNS = typeof document.createElementNS === 'function'

describe('selection.append', () => {
  it('selection.append(...) returns a selection', () => {
    expect(select(document.body).append('h1') instanceof Selection).toBe(true)
    document.body.innerHTML = ''
  })

  it('selection.append(name) appends a new element of the specified name as the last child of each selected element', () => {
    document.body.innerHTML = '<div id="one"><span class="before"></span></div><div id="two"><span class="before"></span></div>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two]).append('span')
    const three = one.querySelector('span:last-child')!
    const four = two.querySelector('span:last-child')!
    assertSelection(s, { groups: [[three, four]] })
    document.body.innerHTML = ''
  })

  it('selection.append(name) observes the specified namespace, if any', () => {
    if (!supportsNS) return
    document.body.innerHTML = '<div id="one"></div><div id="two"></div>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two]).append('svg:g')
    const three = one.querySelector('g')!
    const four = two.querySelector('g')!
    expect(three.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(four.namespaceURI).toBe('http://www.w3.org/2000/svg')
    assertSelection(s, { groups: [[three, four]] })
    document.body.innerHTML = ''
  })

  it('selection.append(name) observes the implicit namespace, if any', () => {
    if (!supportsNS) return
    document.body.innerHTML = '<div id="one"></div><div id="two"></div>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).append('svg')
    const three = one.querySelector('svg')!
    const four = two.querySelector('svg')!
    expect(three.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(four.namespaceURI).toBe('http://www.w3.org/2000/svg')
    assertSelection(sel, { groups: [[three, four]] })
    document.body.innerHTML = ''
  })

  it('selection.append(name) observes the inherited namespace, if any', () => {
    if (!supportsNS) return
    document.body.innerHTML = '<div id="one"></div><div id="two"></div>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).append('svg').append('g')
    const three = one.querySelector('g')!
    const four = two.querySelector('g')!
    expect(three.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(four.namespaceURI).toBe('http://www.w3.org/2000/svg')
    assertSelection(sel, { groups: [[three, four]] })
    document.body.innerHTML = ''
  })

  it('selection.append(function) appends the returned element as the last child of each selected element', () => {
    document.body.innerHTML = '<div id="one"><span class="before"></span></div><div id="two"><span class="before"></span></div>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).append(function () { return document.createElement('SPAN') })
    const three = one.querySelector('span:last-child')!
    const four = two.querySelector('span:last-child')!
    assertSelection(sel, { groups: [[three, four]] })
    document.body.innerHTML = ''
  })

  it('selection.append(function) passes the creator function data, index and group', () => {
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
      .append(function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]); return document.createElement('SPAN') })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })

  it('selection.append(...) propagates data if defined on the originating element', () => {
    document.body.innerHTML = '<parent><child>hello</child></parent>'
    const parent = document.querySelector('parent')! as any
    parent.__data__ = 0
    expect(select(parent).append('child').datum()).toBe(0)
    document.body.innerHTML = ''
  })

  it('selection.append(...) propagates parents from the originating selection', () => {
    document.body.innerHTML = '<parent></parent><parent></parent>'
    const parents = select(document).selectAll('parent')
    const childs = parents.append('child')
    assertSelection(parents, { groups: [document.querySelectorAll('parent')], parents: [document] })
    assertSelection(childs, { groups: [document.querySelectorAll('child')], parents: [document] })
    expect(parents.parents === childs.parents).toBe(true)
    document.body.innerHTML = ''
  })

  it('selection.append(...) can select elements when the originating selection is nested', () => {
    document.body.innerHTML = '<parent id="one"><child></child></parent><parent id="two"><child></child></parent>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).selectAll('child').append('span')
    const three = one.querySelector('span')!
    const four = two.querySelector('span')!
    assertSelection(sel, { groups: [[three], [four]], parents: [one, two] })
    document.body.innerHTML = ''
  })

  it('selection.append(...) skips missing originating elements', () => {
    document.body.innerHTML = '<h1></h1>'
    const h1 = document.querySelector('h1')!
    const sel = selectAll([, h1]).append('span')
    const span = h1.querySelector('span')!
    assertSelection(sel, { groups: [[, span]] })
    document.body.innerHTML = ''
  })
})
