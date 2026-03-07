import { describe, it, expect } from 'bun:test'
import { selectAll } from '../../src/index.ts'

describe('selection.size', () => {
  it('selection.size() returns the number of selected elements', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    expect(selectAll([]).size()).toBe(0)
    expect(selectAll([one]).size()).toBe(1)
    expect(selectAll([one, two]).size()).toBe(2)
    document.body.innerHTML = ''
  })

  it('selection.size() skips missing elements', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    expect(selectAll([, one, , two]).size()).toBe(2)
    document.body.innerHTML = ''
  })
})
