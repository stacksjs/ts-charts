import { describe, it, expect } from 'bun:test'
import { selectorAll } from '../src/index.ts'

describe('selectorAll', () => {
  it('selectorAll(selector).call(element) returns all elements that match the selector', () => {
    document.body.innerHTML = '<div class="foo"></div>'
    const body = document.body
    const div = document.querySelector('div')!
    body.classList.add('foo')
    expect([...selectorAll('body').call(document.documentElement)]).toEqual([body])
    expect([...selectorAll('.foo').call(document.documentElement)]).toEqual([body, div])
    expect([...selectorAll('div.foo').call(document.documentElement)]).toEqual([div])
    expect([...selectorAll('div').call(document.documentElement)]).toEqual([div])
    expect([...selectorAll('h1').call(document.documentElement)]).toEqual([])
    body.classList.remove('foo')
    document.body.innerHTML = ''
  })

  it('selectorAll(null).call(element) always returns the empty array', () => {
    expect(selectorAll(undefined).call(document.documentElement)).toEqual([])
    expect(selectorAll(null).call(document.documentElement)).toEqual([])
  })

  it('selectorAll(null).call(element) returns a new empty array each time', () => {
    const one = selectorAll(undefined)() as any[]
    const two = selectorAll(undefined)() as any[]
    expect(one === two).toBe(false)
    one.push('one')
    expect(selectorAll(undefined)()).toEqual([])
  })
})
