import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.order', () => {
  it('selection.order() moves selected elements so that they are before their next sibling', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([two, one])
    expect(sel.order()).toBe(sel)
    expect(one.nextSibling).toBe(null)
    expect(two.nextSibling).toBe(one)
    document.body.innerHTML = ''
  })

  it('selection.order() only orders within each group', () => {
    document.body.innerHTML = '<h1><span id="one"></span></h1><h1><span id="two"></span></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = select(document).selectAll('h1').selectAll('span')
    expect(sel.order()).toBe(sel)
    expect(one.nextSibling).toBe(null)
    expect(two.nextSibling).toBe(null)
    document.body.innerHTML = ''
  })
})
