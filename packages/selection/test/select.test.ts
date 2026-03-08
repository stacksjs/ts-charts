import { describe, it, expect } from 'bun:test'
import { select, selection, Selection } from '../src/index.ts'
import { assertSelection } from './asserts.ts'

describe('select', () => {
  it('select(...) returns an instanceof Selection', () => {
    expect(select(document) instanceof Selection).toBe(true)
  })

  it('select(string) selects the first element that matches the selector string', () => {
    document.body.innerHTML = '<h1 id="one">foo</h1><h1 id="two">bar</h1>'
    assertSelection(select('h1'), { groups: [[document.querySelector('h1')]], parents: [document.documentElement] })
    document.body.innerHTML = ''
  })

  it('select(element) selects the given element', () => {
    assertSelection(select(document.body), { groups: [[document.body]] })
    assertSelection(select(document.documentElement), { groups: [[document.documentElement]] })
  })

  it('select(window) selects the given window', () => {
    assertSelection(select(document.defaultView), { groups: [[document.defaultView]] })
  })

  it('select(document) selects the given document', () => {
    assertSelection(select(document), { groups: [[document]] })
  })

  it('select(null) selects null', () => {
    assertSelection(select(null), { groups: [[null]] })
    assertSelection(select(undefined), { groups: [[undefined]] })
    assertSelection(select(), { groups: [[undefined]] })
  })

  it('select(object) selects an arbitrary object', () => {
    const object = {}
    assertSelection(select(object as unknown as Node), { groups: [[object]] })
  })
})
