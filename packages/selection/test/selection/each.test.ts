import { describe, it, expect } from 'bun:test'
import { selectAll } from '../../src/index.ts'

describe('selection.each', () => {
  it('selection.each(function) calls the specified function for each selected element in order', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const result: any[] = []
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).datum(function (_d: any, i: number) { return 'node-' + i })
    expect(sel.each(function (this: any, d: any, i: number, nodes: any) { result.push(this, d, i, nodes) })).toBe(sel)
    expect(result).toEqual([one, 'node-0', 0, [one, two], two, 'node-1', 1, [one, two]])
    document.body.innerHTML = ''
  })

  it('selection.each(function) skips missing elements', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const result: any[] = []
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([, one, , two]).datum(function (_d: any, i: number) { return 'node-' + i })
    expect(sel.each(function (this: any, d: any, i: number, nodes: any) { result.push(this, d, i, nodes) })).toBe(sel)
    expect(result).toEqual([one, 'node-1', 1, [, one, , two], two, 'node-3', 3, [, one, , two]])
    document.body.innerHTML = ''
  })
})
