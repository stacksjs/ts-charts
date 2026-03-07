import { describe, it, expect } from 'bun:test'
import * as d3 from '../src/index.ts'

describe('drag exports', () => {
  it('drag methods', () => {
    expect(Object.keys(d3)).toEqual([
      'drag', 'dragDisable', 'dragEnable'
    ])
  })
})
