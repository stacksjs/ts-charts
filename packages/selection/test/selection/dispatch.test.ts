import { describe, it, expect } from 'bun:test'
import { selectAll } from '../../src/index.ts'

describe('selection.dispatch', () => {
  it('selection.dispatch(type) dispatches a custom event of the specified type to each selected element in order', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    let event: any
    const result: any[] = []
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).datum((_d: any, i: number) => `node-${i}`).on('bang', function (this: any, e: any, d: any) { event = e; result.push(this, d) })
    expect(sel.dispatch('bang')).toBe(sel)
    expect(result).toEqual([one, 'node-0', two, 'node-1'])
    expect(event.type).toBe('bang')
    expect(event.bubbles).toBe(false)
    expect(event.cancelable).toBe(false)
    expect(event.detail == null).toBe(true)
    document.body.innerHTML = ''
  })

  it('selection.dispatch(type, params) dispatches a custom event with the specified constant parameters', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    let event: any
    const result: any[] = []
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).datum((_d: any, i: number) => `node-${i}`).on('bang', function (this: any, e: any, d: any) { event = e; result.push(this, d) })
    expect(sel.dispatch('bang', { bubbles: true, cancelable: true, detail: 'loud' })).toBe(sel)
    expect(result).toEqual([one, 'node-0', two, 'node-1'])
    expect(event.type).toBe('bang')
    expect(event.bubbles).toBe(true)
    expect(event.cancelable).toBe(true)
    expect(event.detail).toBe('loud')
    document.body.innerHTML = ''
  })

  it('selection.dispatch(type, function) dispatches a custom event with the specified parameter function', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    const result: any[] = []
    const events: any[] = []
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([one, two]).datum((_d: any, i: number) => `node-${i}`).on('bang', function (this: any, e: any, d: any) { events.push(e); result.push(this, d) })
    expect(sel.dispatch('bang', (_d: any, i: number) => ({ bubbles: true, cancelable: true, detail: 'loud-' + i }))).toBe(sel)
    expect(result).toEqual([one, 'node-0', two, 'node-1'])
    expect(events[0].type).toBe('bang')
    expect(events[0].bubbles).toBe(true)
    expect(events[0].cancelable).toBe(true)
    expect(events[0].detail).toBe('loud-0')
    expect(events[1].type).toBe('bang')
    expect(events[1].bubbles).toBe(true)
    expect(events[1].cancelable).toBe(true)
    expect(events[1].detail).toBe('loud-1')
    document.body.innerHTML = ''
  })

  it('selection.dispatch(type) skips missing elements', () => {
    document.body.innerHTML = '<h1 id="one"></h1><h1 id="two"></h1>'
    let event: any
    const result: any[] = []
    const one = document.querySelector('#one')!
    const two = document.querySelector('#two')!
    const sel = selectAll([, one, , two]).datum((_d: any, i: number) => `node-${i}`).on('bang', function (this: any, e: any, d: any) { event = e; result.push(this, d) })
    expect(sel.dispatch('bang')).toBe(sel)
    expect(result).toEqual([one, 'node-1', two, 'node-3'])
    expect(event.type).toBe('bang')
    expect(event.detail == null).toBe(true)
    document.body.innerHTML = ''
  })
})
