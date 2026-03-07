import { describe, it, expect } from 'bun:test'
import { window as d3window } from '../src/index.ts'

describe('window', () => {
  it('window(node) returns node.ownerDocument.defaultView', () => {
    expect(d3window(document.body)).toBe(document.defaultView)
  })

  it('window(document) returns document.defaultView', () => {
    expect(d3window(document)).toBe(document.defaultView)
  })

  it('window(window) returns window', () => {
    expect(d3window(window)).toBe(window)
  })
})
