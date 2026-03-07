import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'
import { assertSelection, enterNode } from '../asserts.ts'

describe('selection.data', () => {
  it('selection.data(values) binds the specified values to the selected elements by index', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div><div id="three"></div>'
    const one = document.body.querySelector('#one')! as any
    const two = document.body.querySelector('#two')! as any
    const three = document.body.querySelector('#three')! as any
    const sel = select(document.body).selectAll('div').data(['foo', 'bar', 'baz'])
    expect(one.__data__).toBe('foo')
    expect(two.__data__).toBe('bar')
    expect(three.__data__).toBe('baz')
    assertSelection(sel, {
      groups: [[one, two, three]],
      parents: [document.body],
      enter: [[, , ,]],
      exit: [[, , ,]],
    })
    document.body.innerHTML = ''
  })

  it('selection.data(values) accepts an iterable', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div><div id="three"></div>'
    const sel = select(document.body).selectAll('div').data(new Set(['foo', 'bar', 'baz']))
    expect(sel.data()).toEqual(['foo', 'bar', 'baz'])
    document.body.innerHTML = ''
  })

  it('selection.data() returns the bound data', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div><div id="three"></div>'
    const sel = select(document.body).selectAll('div').data(['foo', 'bar', 'baz'])
    expect(sel.data()).toEqual(['foo', 'bar', 'baz'])
    document.body.innerHTML = ''
  })

  it('selection.data(values) puts unbound data in the enter selection', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div>'
    const one = document.body.querySelector('#one')! as any
    const two = document.body.querySelector('#two')! as any
    const sel = select(document.body).selectAll('div').data(['foo', 'bar', 'baz'])
    expect(one.__data__).toBe('foo')
    expect(two.__data__).toBe('bar')
    assertSelection(sel, {
      groups: [[one, two, ,]],
      parents: [document.body],
      enter: [[, , enterNode(document.body, 'baz')]],
      exit: [[, ,]],
    })
    document.body.innerHTML = ''
  })

  it('selection.data(values) puts unbound elements in the exit selection', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div><div id="three"></div>'
    const one = document.body.querySelector('#one')! as any
    const two = document.body.querySelector('#two')! as any
    const three = document.body.querySelector('#three')!
    const sel = select(document.body).selectAll('div').data(['foo', 'bar'])
    expect(one.__data__).toBe('foo')
    expect(two.__data__).toBe('bar')
    assertSelection(sel, {
      groups: [[one, two,]],
      parents: [document.body],
      enter: [[, ,]],
      exit: [[, , three]],
    })
    document.body.innerHTML = ''
  })

  it('selection.data(function) binds the specified return values to the selected elements by index', () => {
    document.body.innerHTML = '<div id="one"></div><div id="two"></div><div id="three"></div>'
    const one = document.body.querySelector('#one')! as any
    const two = document.body.querySelector('#two')! as any
    const three = document.body.querySelector('#three')! as any
    const sel = select(document.body).selectAll('div').data(function () { return ['foo', 'bar', 'baz'] })
    expect(one.__data__).toBe('foo')
    expect(two.__data__).toBe('bar')
    expect(three.__data__).toBe('baz')
    assertSelection(sel, {
      groups: [[one, two, three]],
      parents: [document.body],
      enter: [[, , ,]],
      exit: [[, , ,]],
    })
    document.body.innerHTML = ''
  })

  it('selection.data(function) passes the values function datum, index and parents', () => {
    document.body.innerHTML = '<parent id="one"><child></child><child></child></parent><parent id="two"><child></child></parent>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const results: any[] = []

    selectAll([one, two])
      .datum(function (_d: any, i: number) { return 'parent-' + i })
      .selectAll('child')
      .data(function (this: any, d: any, i: number, nodes: any) { results.push([this, d, i, nodes]); return ['foo', 'bar'] })

    expect(results).toEqual([
      [one, 'parent-0', 0, [one, two]],
      [two, 'parent-1', 1, [one, two]],
    ])
    document.body.innerHTML = ''
  })

  it('selection.data(values, function) joins data to element using the computed keys', () => {
    document.body.innerHTML = '<node id="one"></node><node id="two"></node><node id="three"></node>'
    const one = document.body.querySelector('#one')!
    const two = document.body.querySelector('#two')!
    const three = document.body.querySelector('#three')!
    const sel = select(document.body).selectAll('node').data(['one', 'four', 'three'], function (this: any, d: any) { return d || this.getAttribute('id') })
    assertSelection(sel, {
      groups: [[one, , three]],
      parents: [document.body],
      enter: [[, enterNode(document.body, 'four', '#three'), ,]],
      exit: [[, two, ,]],
    })
    document.body.innerHTML = ''
  })

  it('selection.data(values) returns a new selection, and does not modify the original selection', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const root = document.documentElement
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const selection0 = select(root).selectAll('h1')
    const selection1 = selection0.data([1, 2, 3])
    const selection2 = selection1.data([1])
    assertSelection(selection0, {
      groups: [[one, two]],
      parents: [root],
    })
    assertSelection(selection1, {
      groups: [[one, two, ,]],
      parents: [root],
      enter: [[, , enterNode(root, 3),]],
      exit: [[, ,]],
    })
    assertSelection(selection2, {
      groups: [[one]],
      parents: [root],
      enter: [[,]],
      exit: [[, two, ,]],
    })
    document.body.innerHTML = ''
  })
})
