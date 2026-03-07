import { describe, expect, it } from 'bun:test'
import { Color, Cubehelix, color, cubehelix } from '../src/index.ts'

describe('cubehelix', () => {
  it('cubehelix(...) returns an instance of cubehelix and color', () => {
    const c = cubehelix('steelblue')
    expect(c instanceof Cubehelix).toBe(true)
    expect(c instanceof Color).toBe(true)
  })
})
