import { describe, it, expect } from 'bun:test'
import { forceSimulation, forceX, forceY } from '../src/index.ts'
import { assertNodeEqual } from './asserts.ts'

describe('forceX', () => {
  it('forceX centers nodes', () => {
    const x = forceX(200)
    const f = forceSimulation().force('x', x).stop()
    const a = { x: 100, y: 0 } as any, b = { x: 200, y: 0 } as any, c = { x: 300, y: 0 } as any
    f.nodes([a, b, c])
    f.tick(30)
    expect(a.x > 190).toBe(true)
    expect(a.vx > 0).toBe(true)
    expect(b.x).toBe(200)
    expect(b.vx).toBe(0)
    expect(c.x < 210).toBe(true)
    expect(c.vx < 0).toBe(true)
  })

  it('forceY centers nodes', () => {
    const y = forceY(200)
    const f = forceSimulation().force('y', y).stop()
    const a = { y: 100, x: 0 } as any, b = { y: 200, x: 0 } as any, c = { y: 300, x: 0 } as any
    f.nodes([a, b, c])
    f.tick(30)
    expect(a.y > 190).toBe(true)
    expect(a.vy > 0).toBe(true)
    expect(b.y).toBe(200)
    expect(b.vy).toBe(0)
    expect(c.y < 210).toBe(true)
    expect(c.vy < 0).toBe(true)
  })

  it('forceX respects fixed positions', () => {
    const x = forceX(200)
    const f = forceSimulation().force('x', x).stop()
    const a = { fx: 0, fy: 0 } as any, b = {} as any, c = {} as any
    f.nodes([a, b, c])
    f.tick()
    assertNodeEqual(a, { fx: 0, fy: 0, index: 0, x: 0, y: 0, vy: 0, vx: 0 })
  })

  it('forceY respects fixed positions', () => {
    const y = forceX(200)
    const f = forceSimulation().force('y', y).stop()
    const a = { fx: 0, fy: 0 } as any, b = {} as any, c = {} as any
    f.nodes([a, b, c])
    f.tick()
    assertNodeEqual(a, { fx: 0, fy: 0, index: 0, x: 0, y: 0, vy: 0, vx: 0 })
  })

  it('forceX.x() accessor', () => {
    const x = forceX().x((d: any) => d.x0)
    const f = forceSimulation().force('x', x).stop()
    const a = { x: 100, y: 0, x0: 300 } as any, b = { x: 200, y: 0, x0: 200 } as any, c = { x: 300, y: 0, x0: 100 } as any
    f.nodes([a, b, c])
    f.tick(30)
    expect(a.x > 290).toBe(true)
    expect(a.vx > 0).toBe(true)
    expect(b.x).toBe(200)
    expect(b.vx).toBe(0)
    expect(c.x < 110).toBe(true)
    expect(c.vx < 0).toBe(true)
  })

  it('forceY.y() accessor', () => {
    const y = forceY().y((d: any) => d.y0)
    const f = forceSimulation().force('y', y).stop()
    const a = { y: 100, x: 0, y0: 300 } as any, b = { y: 200, x: 0, y0: 200 } as any, c = { y: 300, x: 0, y0: 100 } as any
    f.nodes([a, b, c])
    f.tick(30)
    expect(a.y > 290).toBe(true)
    expect(a.vy > 0).toBe(true)
    expect(b.y).toBe(200)
    expect(b.vy).toBe(0)
    expect(c.y < 110).toBe(true)
    expect(c.vy < 0).toBe(true)
  })
})
