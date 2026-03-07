import { describe, expect, it } from 'bun:test'
import { ribbon } from '../src/index.ts'

describe('ribbon', () => {
  it('ribbon() has the expected defaults', () => {
    const r = ribbon()
    expect(r.radius()({ radius: 42 })).toBe(42)
    expect(r.startAngle()({ startAngle: 42 })).toBe(42)
    expect(r.endAngle()({ endAngle: 42 })).toBe(42)
    expect(r.source()({ source: { name: 'foo' } })).toEqual({ name: 'foo' })
    expect(r.target()({ target: { name: 'foo' } })).toEqual({ name: 'foo' })
    expect(r.context()).toBe(null)
  })

  it('ribbon.radius(radius) sets the radius accessor', () => {
    const foo = (d: any) => d.foo
    const r = ribbon()
    expect(r.radius(foo)).toBe(r)
    expect(r.radius()).toBe(foo)
    expect(r.radius(42)).toBe(r)
    expect(r.radius()()).toBe(42)
  })

  it('ribbon.startAngle(startAngle) sets the startAngle accessor', () => {
    const foo = (d: any) => d.foo
    const r = ribbon()
    expect(r.startAngle(foo)).toBe(r)
    expect(r.startAngle()).toBe(foo)
    expect(r.startAngle(1.2)).toBe(r)
    expect(r.startAngle()()).toBe(1.2)
  })

  it('ribbon.endAngle(endAngle) sets the endAngle accessor', () => {
    const foo = (d: any) => d.foo
    const r = ribbon()
    expect(r.endAngle(foo)).toBe(r)
    expect(r.endAngle()).toBe(foo)
    expect(r.endAngle(1.2)).toBe(r)
    expect(r.endAngle()()).toBe(1.2)
  })

  it('ribbon.source(source) sets the source accessor', () => {
    const foo = (d: any) => d.foo
    const r = ribbon()
    expect(r.source(foo)).toBe(r)
    expect(r.source()).toBe(foo)
  })

  it('ribbon.target(target) sets the target accessor', () => {
    const foo = (d: any) => d.foo
    const r = ribbon()
    expect(r.target(foo)).toBe(r)
    expect(r.target()).toBe(foo)
  })
})
