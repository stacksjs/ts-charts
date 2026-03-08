import { describe, it, expect } from 'bun:test'
import { selectAll } from '../../src/index.ts'
import { assertSelection } from '../asserts.ts'

describe('selection.sort', () => {
  it('selection.sort(...) returns a new selection, sorting each group\'s data, and then ordering the elements to match', () => {
    document.body.innerHTML = '<h1 id="one" data-value="1"></h1><h1 id="two" data-value="0"></h1><h1 id="three" data-value="2"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const three = document.querySelector('#three')!
    const selection0 = selectAll([two, three, one]).datum(function (this: any) { return +this.getAttribute('data-value') })
    const selection1 = selection0.sort(function (a: any, b: any) { return a - b })
    assertSelection(selection0, { groups: [[two, three, one]], parents: [null] })
    assertSelection(selection1, { groups: [[two, one, three]], parents: [null] })
    expect(two.nextSibling).toBe(one)
    expect(one.nextSibling).toBe(three)
    expect(three.nextSibling).toBe(null)
    document.body.innerHTML = ''
  })

  it('selection.sort() uses natural ascending order', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([two, one]).datum(function (_d: any, i: number) { return i })
    assertSelection(sel.sort(), { groups: [[two, one]], parents: [null] })
    expect(one.nextSibling).toBe(null)
    expect(two.nextSibling).toBe(one)
    document.body.innerHTML = ''
  })

  it('selection.sort(function) uses the specified data comparator function', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([two, one]).datum(function (_d: any, i: number) { return i })
    assertSelection(sel.sort(function (a: any, b: any) { return b - a }), { groups: [[one, two]], parents: [null] })
    expect(one.nextSibling).toBe(two)
    expect(two.nextSibling).toBe(null)
    document.body.innerHTML = ''
  })

  it('selection.sort(function) returns a new selection, and does not modify the groups array in-place', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const selection0 = selectAll([one, two]).datum(function (_d: any, i: number) { return i })
    const selection1 = selection0.sort(function (a: any, b: any) { return b - a })
    const selection2 = selection1.sort()
    assertSelection(selection0, { groups: [[one, two]], parents: [null] })
    assertSelection(selection1, { groups: [[two, one]], parents: [null] })
    assertSelection(selection2, { groups: [[one, two]], parents: [null] })
    document.body.innerHTML = ''
  })
})
