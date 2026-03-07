import { describe, it, expect } from 'bun:test'
import { forceSimulation } from '../src/index.ts'

describe('simulation.find', () => {
  it('simulation.find finds a node', () => {
    const f = forceSimulation().stop()
    const a = { x: 5, y: 0 } as any, b = { x: 10, y: 16 } as any, c = { x: -10, y: -4 } as any
    f.nodes([a, b, c])
    expect(f.find(0, 0)).toBe(a)
    expect(f.find(0, 20)).toBe(b)
  })

  it('simulation.find(x, y, radius) finds a node within radius', () => {
    const f = forceSimulation().stop()
    const a = { x: 5, y: 0 } as any, b = { x: 10, y: 16 } as any, c = { x: -10, y: -4 } as any
    f.nodes([a, b, c])
    expect(f.find(0, 0)).toBe(a)
    expect(f.find(0, 0, 1)).toBe(undefined)
    expect(f.find(0, 20)).toBe(b)
  })
})
