import { describe, it, expect } from 'bun:test'
import { select } from '../../src/index.ts'

describe('selection.call', () => {
  it('selection.call(function) calls the specified function, passing the selection', () => {
    let result: any
    const s = select(document)
    expect(s.call((sel: any) => { result = sel })).toBe(s)
    expect(result).toBe(s)
  })

  it('selection.call(function, arguments...) calls the specified function, passing the additional arguments', () => {
    const result: any[] = []
    const foo = {}
    const bar = {}
    const s = select(document)
    expect(s.call((sel: any, a: any, b: any) => { result.push(sel, a, b) }, foo, bar)).toBe(s)
    expect(result).toEqual([s, foo, bar])
  })
})
