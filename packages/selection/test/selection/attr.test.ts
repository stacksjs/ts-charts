import { describe, it, expect } from 'bun:test'
import { namespaces, select, selectAll } from '../../src/index.ts'

describe('selection.attr', () => {
  it('selection.attr(name) returns the value of the attribute with the specified name on the first selected element', () => {
    document.body.innerHTML = '<h1 class="c1 c2">hello</h1><h1 class="c3"></h1>'
    expect(select(document).select('h1').attr('class')).toBe('c1 c2')
    expect(selectAll([null, document]).select('h1').attr('class')).toBe('c1 c2')
    document.body.innerHTML = ''
  })

  it('selection.attr(name) observes the namespace prefix, if any', () => {
    const sel = select({
      getAttribute(name: string) { return name === 'foo' ? 'bar' : null },
      getAttributeNS(url: string, name: string) { return url === 'http://www.w3.org/2000/svg' && name === 'foo' ? 'svg:bar' : null },
    } as any)
    expect(sel.attr('foo')).toBe('bar')
    expect(sel.attr('svg:foo')).toBe('svg:bar')
  })

  it('selection.attr(name, value) sets the value of the attribute with the specified name on the selected elements', () => {
    document.body.innerHTML = '<h1 id="one" class="c1 c2">hello</h1><h1 id="two" class="c3"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two])
    expect(s.attr('foo', 'bar')).toBe(s)
    expect(one.getAttribute('foo')).toBe('bar')
    expect(two.getAttribute('foo')).toBe('bar')
    document.body.innerHTML = ''
  })

  it('selection.attr(name, null) removes the attribute with the specified name on the selected elements', () => {
    document.body.innerHTML = '<h1 id="one" foo="bar" class="c1 c2">hello</h1><h1 id="two" foo="bar" class="c3"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two])
    expect(s.attr('foo', null)).toBe(s)
    expect(one.hasAttribute('foo')).toBe(false)
    expect(two.hasAttribute('foo')).toBe(false)
    document.body.innerHTML = ''
  })

  it('selection.attr(name, function) sets the value of the attribute with the specified name on the selected elements', () => {
    document.body.innerHTML = '<h1 id="one" class="c1 c2">hello</h1><h1 id="two" class="c3"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two])
    expect(sel.attr('foo', function (_d: any, i: number) { return i ? 'bar-' + i : null })).toBe(sel)
    expect(one.hasAttribute('foo')).toBe(false)
    expect(two.getAttribute('foo')).toBe('bar-1')
    document.body.innerHTML = ''
  })

  it('selection.attr(name, function) passes the value function data, index and group', () => {
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
      .attr('foo', function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]); return null })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })
})
