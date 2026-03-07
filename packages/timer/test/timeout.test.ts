import { describe, it, expect } from 'bun:test'
import { now, timeout, timer, Timer } from '../src/index.ts'
import { assertInRange } from './asserts.ts'

describe('timeout', () => {
  it('timeout(callback) invokes the callback once', (done) => {
    let count = 0
    timeout(() => {
      expect(++count).toBe(1)
      done()
    })
  })

  it('timeout(callback, delay) invokes the callback once after the specified delay', (done) => {
    const then = now()
    const delay = 50
    timeout(() => {
      assertInRange(now() - then, delay - 10, delay + 25)
      done()
    }, delay)
  })

  it('timeout(callback, delay, time) invokes the callback once after the specified delay relative to the given time', (done) => {
    const then = now() + 50
    const delay = 50
    timeout(() => {
      assertInRange(now() - then, delay - 10, delay + 25)
      done()
    }, delay, then)
  })

  it('timeout(callback) passes the callback the elapsed time', (done) => {
    const then = now()
    timeout((elapsed: number) => {
      expect(elapsed).toBe(now() - then)
      done()
    })
  })

  it('timeout(callback) returns a timer', (done) => {
    let count = 0
    const t = timeout(() => { ++count })
    expect(t instanceof Timer).toBe(true)
    t.stop()
    setTimeout(() => {
      expect(count).toBe(0)
      done()
    }, 100)
  })
})
