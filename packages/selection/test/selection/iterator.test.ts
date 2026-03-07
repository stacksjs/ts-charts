import { describe, it, expect } from 'bun:test'
import { selectAll } from '../../src/index.ts'

describe('selection iterator', () => {
  it('selections are iterable over the selected nodes', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    expect([...selectAll([one, two])]).toEqual([one, two])
    document.body.innerHTML = ''
  })

  it('selection iteration merges nodes from all groups into a single array', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    expect([...selectAll([one, two]).selectAll(function (this: any) { return [this] })]).toEqual([one, two])
    document.body.innerHTML = ''
  })

  it('selection iteration skips missing elements', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    expect([...selectAll([, one, , two])]).toEqual([one, two])
    document.body.innerHTML = ''
  })
})
