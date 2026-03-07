import { describe, it, expect } from 'bun:test'
import { select } from '../../src/index.ts'
import { assertSelection } from '../asserts.ts'

describe('selection.exit', () => {
  it('selection.exit() returns an empty selection before a data-join', () => {
    const sel = select(document.body)
    assertSelection(sel.exit(), { groups: [[,]] })
  })

  it('selection.exit() shares the update selection\'s parents', () => {
    const sel = select(document.body)
    expect(sel.exit()._parents).toBe(sel._parents)
  })

  it('selection.exit() returns the same selection each time', () => {
    const sel = select(document.body)
    expect(sel.exit()).toEqual(sel.exit())
  })

  it('selection.exit() contains unbound elements after a data-join', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div>'
    const sel = select(document.body).selectAll('div').data(['foo'])
    assertSelection(sel.exit(), { groups: [[, document.body.querySelector('#two')]], parents: [document.body] })
    document.body.innerHTML = ''
  })

  it('selection.exit() uses the order of the originating selection', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div><div id="three"></div>'
    const sel = select(document.body).selectAll('div').data(['three', 'one'], function (this: any, d: any) { return d || this.id })
    assertSelection(sel.exit(), { groups: [[, document.body.querySelector('#two'), ,]], parents: [document.body] })
    document.body.innerHTML = ''
  })
})
