import { describe, it, expect } from 'bun:test'
import { now } from '../src/index.ts'
import { assertInRange } from './asserts.ts'

describe('now', () => {
  it('now() returns the same time when called repeatedly', () => {
    const then = now()
    expect(then).toBeGreaterThan(0)
    expect(now()).toBe(then)
  })

  it('now() returns a different time when called after a timeout', (done) => {
    const then = now()
    expect(then).toBeGreaterThan(0)
    setTimeout(() => {
      assertInRange(now() - then, 50 - 10, 50 + 10)
      done()
    }, 50)
  })
})
