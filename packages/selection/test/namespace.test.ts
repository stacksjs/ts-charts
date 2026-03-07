import { describe, it, expect } from 'bun:test'
import { namespace, namespaces } from '../src/index.ts'

describe('namespace', () => {
  it('namespace(name) returns name if there is no namespace prefix', () => {
    expect(namespace('foo')).toBe('foo')
    expect(namespace('foo:bar')).toBe('bar')
  })

  it('namespace(name) coerces name to a string', () => {
    expect(namespace({ toString() { return 'foo' } } as any)).toBe('foo')
    expect(namespace({ toString() { return 'svg' } } as any)).toEqual({ space: 'http://www.w3.org/2000/svg', local: 'svg' })
  })

  it('namespace(name) returns the expected values for built-in namespaces', () => {
    expect(namespace('svg')).toEqual({ space: 'http://www.w3.org/2000/svg', local: 'svg' })
    expect(namespace('xhtml')).toEqual({ space: 'http://www.w3.org/1999/xhtml', local: 'xhtml' })
    expect(namespace('xlink')).toEqual({ space: 'http://www.w3.org/1999/xlink', local: 'xlink' })
    expect(namespace('xml')).toEqual({ space: 'http://www.w3.org/XML/1998/namespace', local: 'xml' })
    expect(namespace('svg:g')).toEqual({ space: 'http://www.w3.org/2000/svg', local: 'g' })
    expect(namespace('xhtml:b')).toEqual({ space: 'http://www.w3.org/1999/xhtml', local: 'b' })
    expect(namespace('xlink:href')).toEqual({ space: 'http://www.w3.org/1999/xlink', local: 'href' })
    expect(namespace('xml:lang')).toEqual({ space: 'http://www.w3.org/XML/1998/namespace', local: 'lang' })
  })

  it('namespace("xmlns:...") treats the whole name as the local name', () => {
    expect(namespace('xmlns:xlink')).toEqual({ space: 'http://www.w3.org/2000/xmlns/', local: 'xmlns:xlink' })
  })

  it('namespace(name) observes modifications to namespaces', () => {
    ;(namespaces as any).d3js = 'https://d3js.org/2016/namespace'
    expect(namespace('d3js:pie')).toEqual({ space: 'https://d3js.org/2016/namespace', local: 'pie' })
    delete (namespaces as any).d3js
    expect(namespace('d3js:pie')).toBe('pie')
  })
})
