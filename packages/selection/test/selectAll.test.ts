import { describe, it, expect } from 'bun:test'
import { selectAll, Selection } from '../src/index.ts'
import { assertSelection } from './asserts.ts'

describe('selectAll', () => {
  it('selectAll(...) returns an instanceof Selection', () => {
    expect(selectAll([document]) instanceof Selection).toBe(true)
  })

  it('selectAll(...) accepts an iterable', () => {
    expect(selectAll(new Set([document])).nodes()).toEqual([document])
  })

  it('selectAll(string) selects all elements that match the selector string, in order', () => {
    document.body.innerHTML = '<h1 id="one">foo</h1><h1 id="two">bar</h1>'
    assertSelection(selectAll('h1'), { groups: [document.querySelectorAll('h1')], parents: [document.documentElement] })
    document.body.innerHTML = ''
  })

  it('selectAll(array) selects an array of elements', () => {
    document.body.innerHTML = '<h1>hello</h1><h2>world</h2>'
    const h1 = document.querySelector('h1')!
    const h2 = document.querySelector('h2')!
    assertSelection(selectAll([h1, h2]), { groups: [[h1, h2]] })
    document.body.innerHTML = ''
  })

  it('selectAll(array) can select an empty array', () => {
    assertSelection(selectAll([]), { groups: [[]] })
  })

  it('selectAll(null) selects an empty array', () => {
    assertSelection(selectAll(), { groups: [[]] })
    assertSelection(selectAll(null), { groups: [[]] })
    assertSelection(selectAll(undefined), { groups: [[]] })
  })

  it('selectAll(null) selects a new empty array each time', () => {
    const one = selectAll()._groups[0]
    const two = selectAll()._groups[0]
    expect(one === two).toBe(false)
    one.push('one')
    expect(selectAll()._groups[0]).toEqual([])
  })

  it('selectAll(array) can select an array that contains null', () => {
    document.body.innerHTML = '<h1>hello</h1>'
    const h1 = document.querySelector('h1')!
    assertSelection(selectAll([null, h1, null]), { groups: [[null, h1, null]] })
    document.body.innerHTML = ''
  })

  it('selectAll(array) can select an array that contains arbitrary objects', () => {
    const object = {}
    assertSelection(selectAll([object]), { groups: [[object]] })
  })
})
