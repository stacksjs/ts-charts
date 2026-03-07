import { describe, it, expect } from 'bun:test'
import { zoom, zoomIdentity } from '../src/index.ts'
import { select } from '@ts-charts/selection'

describe('zoom events', () => {
  it('zoom.filter receives (event, d) and filters', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    div.call(z.transform, zoomIdentity)
    z.filter()
    const event = { bubbles: true, cancelable: true, detail: { type: 'fake' } }
    let a: any, b: any
    z.on('zoom', function () { b = arguments }).filter(function () { a = arguments })
    div.dispatch('dblclick', event)
    expect(a[0].detail.type).toBe('fake')
    expect(a[1]).toBe('hello')
    expect(b).toBe(undefined) // our fake dblclick was rejected
    // temporary: avoid a crash due to starting a transition
    z.duration(0)
    z.filter(() => true)
    div.dispatch('dblclick', event)
    expect(b !== undefined).toBe(true) // our fake dblclick was accepted
    div.interrupt()
  })

  it('zoom.extent receives (d)', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    div.call(z.transform, zoomIdentity)
    const extentFn = z.extent()
    const event = { bubbles: true, cancelable: true, detail: { type: 'fake' } }
    let a: any
    z.extent(function (this: any) {
      a = arguments
      a[-1] = this
      return extentFn.apply(this, arguments)
    })
    div.dispatch('dblclick', event)
    expect(a[0]).toBe('hello')
    expect(a[-1]).toBe(div.node())
    div.interrupt()
  })
})
