import { describe, it, expect } from 'bun:test'
import { select } from '../../src/index.ts'
import { assertSelection, enterNode } from '../asserts.ts'

describe('selection.enter', () => {
  it('selection.enter() returns an empty selection before a data-join', () => {
    const s = select(document.body)
    assertSelection(s.enter(), { groups: [[,]], parents: [null] })
  })

  it('selection.enter() contains EnterNodes', () => {
    document.body.innerHTML = ''
    const s = select(document.body).selectAll('div').data([1, 2, 3])
    expect((s.enter().node() as any)._parent).toBe(document.body)
  })

  it('selection.enter() shares the update selection\'s parents', () => {
    const s = select(document.body)
    expect(s.enter()._parents).toBe(s._parents)
  })

  it('selection.enter() returns the same selection each time', () => {
    const s = select(document.body)
    expect(s.enter()).toEqual(s.enter())
  })

  it('selection.enter() contains unbound data after a data-join', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div>'
    const s = select(document.body).selectAll('div').data(['foo', 'bar', 'baz'])
    assertSelection(s.enter(), {
      groups: [[, , enterNode(document.body, 'baz')]],
      parents: [document.body],
    })
    document.body.innerHTML = ''
  })

  it('selection.enter() uses the order of the data', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div><div id="three"></div>'
    const sel = select(document.body).selectAll('div').data(['one', 'four', 'three', 'five'], function (this: any, d: any) { return d || this.getAttribute('id') })
    assertSelection(sel.enter(), {
      groups: [[, enterNode(document.body, 'four', '#three'), , enterNode(document.body, 'five')]],
      parents: [document.body],
    })
    document.body.innerHTML = ''
  })

  it('enter.append(...) inherits the namespaceURI from the parent', () => {
    if (typeof document.createElementNS !== 'function') return
    document.body.innerHTML = ''
    const root = select(document.body).append('div')
    const svg = root.append('svg')
    const g = svg.selectAll('g').data(['foo']).enter().append('g')
    expect(root.node()!.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    expect(svg.node()!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(g.node()!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    document.body.innerHTML = ''
  })

  it('enter.append(...) does not override an explicit namespace', () => {
    if (typeof document.createElementNS !== 'function') return
    document.body.innerHTML = ''
    const root = select(document.body).append('div')
    const svg = root.append('svg')
    const g = svg.selectAll('g').data(['foo']).enter().append('xhtml:g')
    expect(root.node()!.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    expect(svg.node()!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(g.node()!.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    document.body.innerHTML = ''
  })

  it('enter.append(...) inserts entering nodes before the next node in the update selection', () => {
    document.body.innerHTML = ''
    const identity = function (d: any) { return d }
    let p = select(document.body).selectAll('p')
    p = p.data([1, 3], identity)
    p = p.enter().append('p').text(identity).merge(p)
    p = p.data([0, 1, 2, 3, 4], identity)
    p = p.enter().append('p').text(identity).merge(p)
    expect(document.body.innerHTML).toBe('<p>0</p><p>1</p><p>2</p><p>3</p><p>4</p>')
    document.body.innerHTML = ''
  })

  it('enter.insert(..., before) inserts entering nodes before the sibling matching the specified selector', () => {
    document.body.innerHTML = '<hr>'
    const identity = function (d: any) { return d }
    let p = select(document.body).selectAll('p')
    p = p.data([1, 3], identity)
    p = p.enter().insert('p', 'hr').text(identity).merge(p)
    p = p.data([0, 1, 2, 3, 4], identity)
    p = p.enter().insert('p', 'hr').text(identity).merge(p)
    // happy-dom serializes <hr> as <hr/>
    const expected = '<p>1</p><p>3</p><p>0</p><p>2</p><p>4</p>'
    expect(document.body.innerHTML.replace(/<hr\/?>/g, '')).toBe(expected)
    document.body.innerHTML = ''
  })

  it('enter.insert(..., null) inserts entering nodes after the last child', () => {
    document.body.innerHTML = ''
    const identity = function (d: any) { return d }
    let p = select(document.body).selectAll('p')
    p = p.data([1, 3], identity)
    p = p.enter().insert('p', null).text(identity).merge(p)
    p = p.data([0, 1, 2, 3, 4], identity)
    p = p.enter().insert('p', null).text(identity).merge(p)
    expect(document.body.innerHTML).toBe('<p>1</p><p>3</p><p>0</p><p>2</p><p>4</p>')
    document.body.innerHTML = ''
  })
})
