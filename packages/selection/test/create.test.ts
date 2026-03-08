import { describe, it, expect } from 'bun:test'
import { create } from '../src/index.ts'

const supportsNS = typeof document.createElementNS === 'function'

describe('create', () => {
  it('create(name) returns a new HTML element with the given name', () => {
    const h1 = create('h1')
    if (supportsNS) expect(h1._groups[0][0]!.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    expect(h1._groups[0][0]!.tagName).toBe('H1')
    expect(h1._parents).toEqual([null])
  })

  it('create(name) returns a new SVG element with the given name', () => {
    if (!supportsNS) return // happy-dom does not support createElementNS
    const svg = create('svg')
    expect(svg._groups[0][0]!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(svg._groups[0][0]!.tagName).toBe('svg')
    expect(svg._parents).toEqual([null])
  })
})
