import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.on', () => {
  it('selection.on(type, listener) registers a listener for the specified event type on each selected element', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    let clicks = 0
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two])
    expect(s.on('click', () => { ++clicks })).toBe(s)
    s.dispatch('click')
    expect(clicks).toBe(2)
    s.dispatch('tick')
    expect(clicks).toBe(2)
    document.body.innerHTML = ''
  })

  it('selection.on(type, listener) observes the specified name, if any', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    let foo = 0
    let bar = 0
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two]).on('click.foo', () => { ++foo }).on('click.bar', () => { ++bar })
    s.dispatch('click')
    expect(foo).toBe(2)
    expect(bar).toBe(2)
    document.body.innerHTML = ''
  })

  it('selection.on(type, listener, capture) observes the specified capture flag, if any', () => {
    let result: any
    const s = select({ addEventListener: (_type: string, _listener: any, capture: any) => { result = capture } } as any)
    expect(s.on('click.foo', () => {}, true)).toBe(s)
    expect(result).toBe(true)
  })

  it('selection.on(type) returns the listener for the specified event type, if any', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const clicked = () => {}
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two]).on('click', clicked)
    expect(s.on('click')).toBe(clicked)
    document.body.innerHTML = ''
  })

  it('selection.on(type) observes the specified name, if any', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const clicked = () => {}
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two]).on('click.foo', clicked)
    expect(s.on('click')).toBeUndefined()
    expect(s.on('click.foo')).toBe(clicked)
    expect(s.on('click.bar')).toBeUndefined()
    expect(s.on('tick.foo')).toBeUndefined()
    expect(s.on('.foo')).toBeUndefined()
    document.body.innerHTML = ''
  })

  it('selection.on(type, null) removes the listener with the specified name, if any', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    let clicks = 0
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two]).on('click', () => { ++clicks })
    expect(s.on('click', null)).toBe(s)
    expect(s.on('click')).toBeUndefined()
    s.dispatch('click')
    expect(clicks).toBe(0)
    document.body.innerHTML = ''
  })

  it('selection.on(type, null) observes the specified name, if any', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    let foo = 0
    let bar = 0
    const fooed = () => { ++foo }
    const barred = () => { ++bar }
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two]).on('click.foo', fooed).on('click.bar', barred)
    expect(s.on('click.foo', null)).toBe(s)
    expect(s.on('click.foo')).toBeUndefined()
    expect(s.on('click.bar')).toBe(barred)
    s.dispatch('click')
    expect(foo).toBe(0)
    expect(bar).toBe(2)
    document.body.innerHTML = ''
  })

  it('selection.on(name, null) removes all listeners with the specified name', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    let clicks = 0
    let loads = 0
    const clicked = () => { ++clicks }
    const loaded = () => { ++loads }
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const s = selectAll([one, two]).on('click.foo', clicked).on('load.foo', loaded)
    expect(s.on('click.foo')).toBe(clicked)
    expect(s.on('load.foo')).toBe(loaded)
    s.dispatch('click')
    s.dispatch('load')
    expect(clicks).toBe(2)
    expect(loads).toBe(2)
    expect(s.on('.foo', null)).toBe(s)
    expect(s.on('click.foo')).toBeUndefined()
    expect(s.on('load.foo')).toBeUndefined()
    s.dispatch('click')
    s.dispatch('load')
    expect(clicks).toBe(2)
    expect(loads).toBe(2)
    document.body.innerHTML = ''
  })

  it('selection.on(type, listener) passes the event and listener data', () => {
    document.body.innerHTML = '<parent id="one"><child id="three"></child><child id="four"></child></parent><parent id="two"><child id="five"></child></parent>'
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const three = document.querySelector('#three')!
    const four = document.querySelector('#four')!
    const five = document.querySelector('#five')!
    const results: any[] = []

    const s = selectAll([one, two])
      .datum(function (_d: any, i: number) { return 'parent-' + i })
      .selectAll('child')
      .data(function (_d: any, i: number) { return [0, 1].map(function (j) { return 'child-' + i + '-' + j }) })
      .on('foo', function (this: any, e: any, d: any) { results.push([this, e.type, d]) })

    expect(results).toEqual([])
    s.dispatch('foo')
    expect(results).toEqual([
      [three, 'foo', 'child-0-0'],
      [four, 'foo', 'child-0-1'],
      [five, 'foo', 'child-1-0'],
    ])
    document.body.innerHTML = ''
  })

  it('selection.on(type, listener) passes the current listener data', () => {
    const results: any[] = []
    const s = select(document).on('foo', function (_e: any, d: any) { results.push(d) })
    s.dispatch('foo')
    ;(document as any).__data__ = 42
    s.dispatch('foo')
    expect(results).toEqual([undefined, 42])
    delete (document as any).__data__
  })
})
