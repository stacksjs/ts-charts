import { describe, it, expect } from 'bun:test'
import { creator } from '../src/index.ts'

const supportsNS = typeof document.createElementNS === 'function'

describe('creator', () => {
  it('creator(name).call(element) returns a new element with the given name', () => {
    expect(creator('h1').call(document.body).tagName).toBe('H1')
    expect(creator('g').call(document.body).tagName).toBe('G')

    if (supportsNS) {
      expect(creator('h1').call(document.body).namespaceURI).toBe('http://www.w3.org/1999/xhtml')
      expect(creator('xhtml:h1').call(document.body).namespaceURI).toBe('http://www.w3.org/1999/xhtml')
      expect(creator('svg').call(document.body).namespaceURI).toBe('http://www.w3.org/2000/svg')
      expect(creator('g').call(document.body).namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    }
  })

  it('creator(name).call(element) can inherit the namespace from the given element', () => {
    if (!supportsNS) return
    document.body.innerHTML = '<svg></svg>'
    const svg = document.querySelector('svg')!
    expect(creator('g').call(document.body).namespaceURI).toBe('http://www.w3.org/1999/xhtml')
    expect(creator('g').call(svg).namespaceURI).toBe('http://www.w3.org/2000/svg')
    document.body.innerHTML = ''
  })
})
