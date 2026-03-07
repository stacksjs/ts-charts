import { describe, it, expect } from 'bun:test'
import { zoomIdentity, ZoomTransform } from '../src/index.ts'

describe('transform', () => {
  it('zoomIdentity transform contains k = 1, x = y = 0', () => {
    expect(zoomIdentity).toEqual(new (ZoomTransform as any)(1, 0, 0))
  })

  it('transform.scale(k) returns a new transform scaled with k', () => {
    const transform = zoomIdentity.scale(2.5)
    expect(transform.scale(2)).toEqual(new (ZoomTransform as any)(5, 0, 0))
  })

  it('transform.translate(x, y) returns a new transform translated with x and y', () => {
    const transform = zoomIdentity.translate(2, 3)
    expect(transform.translate(-4, 4)).toEqual(new (ZoomTransform as any)(1, -2, 7))
    expect(transform.scale(2).translate(-4, 4)).toEqual(new (ZoomTransform as any)(2, -6, 11))
  })

  it('transform.apply([x, y]) returns the transformation of the specified point', () => {
    expect(zoomIdentity.translate(2, 3).scale(2).apply([4, 5])).toEqual([10, 13])
  })

  it('transform.applyX(x) returns the transformation of the specified x-coordinate', () => {
    expect(zoomIdentity.translate(2, 0).scale(2).applyX(4)).toEqual(10)
  })

  it('transform.applyY(y) returns the transformation of the specified y-coordinate', () => {
    expect(zoomIdentity.translate(0, 3).scale(2).applyY(5)).toEqual(13)
  })

  it('transform.invert([x, y]) returns the inverse transformation of the specified point', () => {
    expect(zoomIdentity.translate(2, 3).scale(2).invert([4, 5])).toEqual([1, 1])
  })

  it('transform.invertX(x) returns the inverse transformation of the specified x-coordinate', () => {
    expect(zoomIdentity.translate(2, 0).scale(2).invertX(4)).toEqual(1)
  })

  it('transform.invertY(y) returns the inverse transformation of the specified y-coordinate', () => {
    expect(zoomIdentity.translate(0, 3).scale(2).invertY(5)).toEqual(1)
  })

  it('transform.toString() returns a string representing the SVG transform', () => {
    expect(zoomIdentity.toString()).toBe('translate(0,0) scale(1)')
  })
})
