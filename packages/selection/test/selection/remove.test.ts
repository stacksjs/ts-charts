import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.remove', () => {
  it('selection.remove() removes selected elements from their parent', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([two, one])
    expect(s.remove()).toBe(s)
    expect(one.parentNode).toBe(null)
    expect(two.parentNode).toBe(null)
    document.body.innerHTML = ''
  })

  it('selection.remove() skips elements that have already been detached', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([two, one])
    one.parentNode!.removeChild(one)
    expect(s.remove()).toBe(s)
    expect(one.parentNode).toBe(null)
    expect(two.parentNode).toBe(null)
    document.body.innerHTML = ''
  })

  it('selection.remove() skips missing elements', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([, one])
    expect(s.remove()).toBe(s)
    expect(one.parentNode).toBe(null)
    expect(two.parentNode).toBe(document.body)
    document.body.innerHTML = ''
  })

  it('selectChildren().remove() removes all children', () => {
    document.body.innerHTML = '<div><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div>'
    const p = document.querySelector('div')!
    const sel = select(p).selectChildren()
    expect(sel.size()).toBe(10)
    expect(sel.remove()).toBe(sel)
    expect(select(p).selectChildren().size()).toBe(0)
    document.body.innerHTML = ''
  })
})
