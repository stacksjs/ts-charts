import { describe, it, expect } from 'bun:test'
import { matcher } from '../src/index.ts'

describe('matcher', () => {
  it('matcher(selector).call(element) returns true if the element matches the selector', () => {
    document.body.classList.add('foo')
    expect(matcher('body').call(document.body)).toBe(true)
    expect(matcher('.foo').call(document.body)).toBe(true)
    expect(matcher('body.foo').call(document.body)).toBe(true)
    expect(matcher('h1').call(document.body)).toBe(false)
    expect(matcher('body.bar').call(document.body)).toBe(false)
    document.body.classList.remove('foo')
  })
})
