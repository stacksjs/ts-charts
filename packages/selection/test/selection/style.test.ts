import { describe, it, expect } from 'bun:test'
import { select, selectAll, style } from '../../src/index.ts'

describe('selection.style', () => {
  it('style(node, name) returns the inline value of the style property with the specified name', () => {
    const node = { style: { getPropertyValue(name: string) { return name === 'color' ? 'red' : '' } } }
    expect(style(node, 'color')).toBe('red')
  })

  it('style(node, name) returns the computed value if there is no inline style', () => {
    const styles = { getPropertyValue(name: string) { return name === 'color' ? 'rgb(255, 0, 0)' : '' } }
    const node: any = { style: { getPropertyValue() { return '' } }, ownerDocument: { defaultView: { getComputedStyle(n: any) { return n === node ? styles : null } } } }
    expect(style(node, 'color')).toBe('rgb(255, 0, 0)')
  })

  it('selection.style(name) returns the inline value of the style property with the specified name on the first selected element', () => {
    const node = { style: { getPropertyValue(name: string) { return name === 'color' ? 'red' : '' } } }
    expect(select(node as any).style('color')).toBe('red')
    expect(selectAll([null, node] as any).style('color')).toBe('red')
  })

  it('selection.style(name, value) sets the value of the style property with the specified name on the selected elements', () => {
    document.body.innerHTML = '<h1 id="one" class="c1 c2">hello</h1><h1 id="two" class="c3"></h1>'
    const one = document.querySelector('#one') as HTMLElement
    const two = document.querySelector('#two') as HTMLElement
    const s = selectAll([one, two])
    expect(s.style('color', 'red')).toBe(s)
    expect(one.style.getPropertyValue('color')).toBe('red')
    if (typeof one.style.getPropertyPriority === 'function') expect(one.style.getPropertyPriority('color')).toBe('')
    expect(two.style.getPropertyValue('color')).toBe('red')
    if (typeof two.style.getPropertyPriority === 'function') expect(two.style.getPropertyPriority('color')).toBe('')
    document.body.innerHTML = ''
  })

  it('selection.style(name, value, priority) sets the value and priority of the style property', () => {
    document.body.innerHTML = '<h1 id="one" class="c1 c2">hello</h1><h1 id="two" class="c3"></h1>'
    const one = document.querySelector('#one') as HTMLElement
    const two = document.querySelector('#two') as HTMLElement
    const s = selectAll([one, two])
    expect(s.style('color', 'red', 'important')).toBe(s)
    expect(one.style.getPropertyValue('color')).toBe('red')
    if (typeof one.style.getPropertyPriority === 'function') expect(one.style.getPropertyPriority('color')).toBe('important')
    expect(two.style.getPropertyValue('color')).toBe('red')
    if (typeof two.style.getPropertyPriority === 'function') expect(two.style.getPropertyPriority('color')).toBe('important')
    document.body.innerHTML = ''
  })

  it('selection.style(name, null) removes the style property with the specified name', () => {
    document.body.innerHTML = '<h1 id="one" style="color:red;" class="c1 c2">hello</h1><h1 id="two" style="color:red;" class="c3"></h1>'
    const one = document.querySelector('#one') as HTMLElement
    const two = document.querySelector('#two') as HTMLElement
    const s = selectAll([one, two])
    expect(s.style('color', null)).toBe(s)
    expect(one.style.getPropertyValue('color')).toBe('')
    expect(two.style.getPropertyValue('color')).toBe('')
    document.body.innerHTML = ''
  })

  it('selection.style(name, function) sets the value of the style property', () => {
    document.body.innerHTML = '<h1 id="one" class="c1 c2">hello</h1><h1 id="two" class="c3"></h1>'
    const one = document.querySelector('#one') as HTMLElement
    const two = document.querySelector('#two') as HTMLElement
    const s = selectAll([one, two])
    expect(s.style('color', function (_d: any, i: number) { return i ? 'red' : null })).toBe(s)
    expect(one.style.getPropertyValue('color')).toBe('')
    expect(two.style.getPropertyValue('color')).toBe('red')
    document.body.innerHTML = ''
  })

  it('selection.style(name, function) passes the value function data, index and group', () => {
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
      .style('color', function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]) })

    expect(results).toEqual([
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five, ,]],
    ])
    document.body.innerHTML = ''
  })
})
