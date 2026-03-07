import { describe, it, expect } from 'bun:test'
import * as d3 from '../src/index.ts'

describe('drag', () => {
  it('exports the expected symbols', () => {
    expect(Object.keys(d3).sort()).toEqual([
      'drag', 'dragDisable', 'dragEnable'
    ].sort())
  })

  it('drag is a function', () => {
    expect(typeof d3.drag).toBe('function')
  })

  it('dragDisable is a function', () => {
    expect(typeof d3.dragDisable).toBe('function')
  })

  it('dragEnable is a function', () => {
    expect(typeof d3.dragEnable).toBe('function')
  })
})
