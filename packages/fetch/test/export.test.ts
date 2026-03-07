import { describe, expect, it } from 'bun:test'
import * as d3 from '../src/index'

describe('fetch methods', () => {
  it('exports all expected functions', () => {
    expect(typeof d3.blob).toBe('function')
    expect(typeof d3.buffer).toBe('function')
    expect(typeof d3.csv).toBe('function')
    expect(typeof d3.dsv).toBe('function')
    expect(typeof d3.html).toBe('function')
    expect(typeof d3.image).toBe('function')
    expect(typeof d3.json).toBe('function')
    expect(typeof d3.svg).toBe('function')
    expect(typeof d3.text).toBe('function')
    expect(typeof d3.tsv).toBe('function')
    expect(typeof d3.xml).toBe('function')
  })
})
