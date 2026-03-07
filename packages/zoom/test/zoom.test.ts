import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { zoom, zoomIdentity, zoomTransform, ZoomTransform } from '../src/index.ts'

describe('zoom', () => {
  it('zoom initiates a zooming behavior', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(1, 0, 0))
    div.call(z.transform, zoomIdentity.scale(2).translate(1, -3))
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(2, 2, -6))
  })

  it('zoomTransform returns the node\'s current transform', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    expect(zoomTransform(div.node())).toEqual(new (ZoomTransform as any)(1, 0, 0))
    div.call(z.translateBy, 10, 10)
    expect(zoomTransform(div.node())).toEqual(new (ZoomTransform as any)(1, 10, 10))
    expect(zoomTransform(div.append('span').node())).toEqual(new (ZoomTransform as any)(1, 10, 10)) // or an ancestor's...
    expect(zoomTransform(document.body)).toEqual(zoomIdentity) // or zoomIdentity
  })

  it('zoom.scaleBy zooms', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    div.call(z.scaleBy, 2, [0, 0])
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(2, 0, 0))
    div.call(z.scaleBy, 2, [2, -2])
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(4, -2, 2))
    div.call(z.scaleBy, 1 / 4, [2, -2])
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(1, 1, -1))
  })

  it('zoom.scaleTo zooms', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    div.call(z.scaleTo, 2)
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(2, 0, 0))
    div.call(z.scaleTo, 2)
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(2, 0, 0))
    div.call(z.scaleTo, 1)
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(1, 0, 0))
  })

  it('zoom.translateBy translates', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    div.call(z.translateBy, 10, 10)
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(1, 10, 10))
    div.call(z.scaleBy, 2)
    div.call(z.translateBy, -10, -10)
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(2, 0, 0))
  })

  it('zoom.scaleBy arguments can be functions passed (datum, index)', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    let a: any, b: any, c: any, d: any
    div.call(
      z.scaleBy,
      function (this: any) {
        a = arguments
        b = this
        return 2
      },
      function (this: any) {
        c = arguments
        d = this
        return [0, 0]
      },
    )
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(2, 0, 0))
    expect(a[0]).toEqual('hello')
    expect(a[1]).toEqual(0)
    expect(b).toEqual(div.node())
    expect(c[0]).toEqual('hello')
    expect(c[1]).toEqual(0)
    expect(d).toEqual(div.node())
  })

  it('zoom.scaleTo arguments can be functions passed (datum, index)', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    let a: any, b: any, c: any, d: any
    div.call(
      z.scaleTo,
      function (this: any) {
        a = arguments
        b = this
        return 2
      },
      function (this: any) {
        c = arguments
        d = this
        return [0, 0]
      },
    )
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(2, 0, 0))
    expect(a[0]).toEqual('hello')
    expect(a[1]).toEqual(0)
    expect(b).toEqual(div.node())
    expect(c[0]).toEqual('hello')
    expect(c[1]).toEqual(0)
    expect(d).toEqual(div.node())
  })

  it('zoom.translateBy arguments can be functions passed (datum, index)', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    let a: any, b: any, c: any, d: any
    div.call(
      z.translateBy,
      function (this: any) {
        a = arguments
        b = this
        return 2
      },
      function (this: any) {
        c = arguments
        d = this
        return 3
      },
    )
    expect(div.node().__zoom).toEqual(new (ZoomTransform as any)(1, 2, 3))
    expect(a[0]).toEqual('hello')
    expect(a[1]).toEqual(0)
    expect(b).toEqual(div.node())
    expect(c[0]).toEqual('hello')
    expect(c[1]).toEqual(0)
    expect(d).toEqual(div.node())
  })

  it('zoom.constrain receives (transform, extent, translateExtent)', () => {
    const div = select(document.body).append('div').datum('hello')
    const z = zoom()
    div.call(z)
    const constrainFn = z.constrain()
    let a: any, b: any
    z.constrain(function (this: any) {
      a = arguments
      return b = constrainFn.apply(this, arguments)
    })
    div.call(z.translateBy, 10, 10)
    expect(a[0]).toEqual(b)
    expect(a[0]).toEqual(new (ZoomTransform as any)(1, 10, 10))
    expect(a[1]).toEqual([[0, 0], [0, 0]])
    expect(a[2][0][0]).toBe(-Infinity)
    z.constrain(constrainFn)
  })
})
