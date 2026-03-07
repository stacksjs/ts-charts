import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { zoom, zoomIdentity } from '../src/index.ts'
import ZoomEvent from '../src/event.ts'

describe('zoom callbacks', () => {
  it('zoom.on(\'zoom\') callback', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    let a: any
    z.on('zoom', function (this: any, event: any, d: any) { a = { event, d, that: this } })
    div.call(z.transform, zoomIdentity)
    const event = new (ZoomEvent as any)('zoom', { sourceEvent: null, target: z, transform: zoomIdentity })
    expect(a).toEqual({ event, d: 'hello', that: div.node() })
    a = {}
    z.on('zoom', null)
    expect(a).toEqual({})
  })

  it('zoom.on(\'start\') callback', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    let a: any
    z.on('start', function (this: any, event: any, d: any) { a = { event, d, that: this } })
    div.call(z.transform, zoomIdentity)
    const event = new (ZoomEvent as any)('start', { sourceEvent: null, target: z, transform: zoomIdentity })
    expect(a).toEqual({ event, d: 'hello', that: div.node() })
    a = {}
    z.on('start', null)
    expect(a).toEqual({})
  })

  it('zoom.on(\'end\') callback', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    let a: any
    z.on('end', function (this: any, event: any, d: any) { a = { event, d, that: this } })
    div.call(z.transform, zoomIdentity)
    const event = new (ZoomEvent as any)('end', { sourceEvent: null, target: z, transform: zoomIdentity })
    expect(a).toEqual({ event, d: 'hello', that: div.node() })
    a = {}
    z.on('end', null)
    expect(a).toEqual({})
  })

  it('zoom.on(\'start zoom end\') callback order', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    const a: string[] = []
    z.on('start zoom end', (event: any) => { a.push(event.type) })
    div.call(z.transform, zoomIdentity)
    expect(a).toEqual(['start', 'zoom', 'end'])
    z.on('start zoom end', null)
  })
})
