import { describe, it, expect } from 'bun:test'
import { now } from '../src/index.ts'

describe('now', () => {
  it('now() returns the same time when called repeatedly', () => {
    const then = now()
    expect(then).toBeGreaterThan(0)
    expect(now()).toBe(then)
  })

  it('now() returns a different time when called after a timeout', async () => {
    const then = now()
    await Bun.sleep(50)
    expect(now()).toBeGreaterThanOrEqual(then + 40)
  })
})
