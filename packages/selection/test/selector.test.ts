import { describe, it, expect } from 'bun:test'
import { selector } from '../src/index.ts'

describe('selector', () => {
  it('selector(selector).call(element) returns the first element that matches the selector', () => {
    expect(selector('body').call(document.documentElement)).toBe(document.body)
    document.body.classList.add('foo')
    expect(selector('.foo').call(document.documentElement)).toBe(document.body)
    expect(selector('body.foo').call(document.documentElement)).toBe(document.body)
    expect(selector('h1').call(document.documentElement)).toBeUndefined()
    expect(selector('body.bar').call(document.documentElement)).toBeUndefined()
    document.body.classList.remove('foo')
  })

  it('selector(null).call(element) always returns undefined', () => {
    expect(selector(undefined).call(document.documentElement)).toBeUndefined()
    expect(selector(null).call(document.documentElement)).toBeUndefined()
  })
})
