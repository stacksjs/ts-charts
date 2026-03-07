import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.node', () => {
  it('selection.node() returns the first element in a selection', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    expect(selectAll([one, two]).node()).toBe(one)
    document.body.innerHTML = ''
  })

  it('selection.node() skips missing elements', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    expect(selectAll([, one, , two]).node()).toBe(one)
    document.body.innerHTML = ''
  })

  it('selection.node() skips empty groups', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    expect(selectAll([one, two]).selectAll(function (this: any, _d: any, i: number) { return i ? [this] : [] }).node()).toBe(two)
    document.body.innerHTML = ''
  })

  it('selection.node() returns null for an empty selection', () => {
    expect(select(null).node()).toBe(null)
    expect(selectAll([]).node()).toBe(null)
    expect(selectAll([, ,]).node()).toBe(null)
  })
})
