import { describe, it, expect } from 'bun:test'
import { now, timer, Timer, timerFlush } from '../src/index.ts'
import { assertInRange } from './asserts.ts'

describe('timer', () => {
  it('timer(callback) returns an instanceof Timer', () => {
    const t = timer(() => {})
    expect(t instanceof Timer).toBe(true)
    t.stop()
  })

  it('timer(callback) verifies that callback is a function', () => {
    expect(() => { (timer as Function)() }).toThrow(TypeError)
    expect(() => { (timer as Function)('42') }).toThrow(TypeError)
    expect(() => { (timer as Function)(null) }).toThrow(TypeError)
  })

  it('timer(callback) invokes the callback about every 17ms', (done) => {
    const then = now()
    let count = 0
    const t = timer(() => {
      if (++count > 10) {
        t.stop()
        assertInRange(now() - then, (17 - 5) * count, (17 + 5) * count)
        done()
      }
    })
  })

  it('timer(callback) invokes the callback until the timer is stopped', (done) => {
    let count = 0
    const t = timer(() => {
      if (++count > 2) {
        t.stop()
        done()
      }
    })
  })

  it('timer(callback) passes the callback the elapsed time', (done) => {
    const then = now()
    let count = 0
    const t = timer((elapsed: number) => {
      ++count
      expect(elapsed).toBe(now() - then)
      if (count > 10) {
        t.stop()
        done()
      }
    })
  })

  it('timer(callback, delay) first invokes the callback after the specified delay', (done) => {
    const then = now()
    const delay = 150
    const t = timer(() => {
      t.stop()
      assertInRange(now() - then, delay - 10, delay + 25)
      done()
    }, delay)
  })

  it('timer(callback, delay) computes the elapsed time relative to the delay', (done) => {
    const delay = 150
    const t = timer((elapsed: number) => {
      t.stop()
      assertInRange(elapsed, 0, 25)
      done()
    }, delay)
  })

  it('timer(callback, delay, time) computes the effective delay relative to the specified time', (done) => {
    const delay = 150
    const skew = 200
    const t = timer((elapsed: number) => {
      t.stop()
      assertInRange(elapsed, skew - delay + 17 - 10, skew - delay + 17 + 25)
      done()
    }, delay, now() - skew)
  })

  it('timer(callback) invokes callbacks in scheduling order during synchronous flush', () => {
    const results: number[] = []
    const t0 = timer(() => { results.push(1); t0.stop() })
    const t1 = timer(() => { results.push(2); t1.stop() })
    const t2 = timer(() => { results.push(3); t2.stop() })
    timerFlush()
    expect(results).toEqual([1, 2, 3])
  })

  it('timer(callback) invokes callbacks in scheduling order during asynchronous flush', (done) => {
    const results: number[] = []
    const t0 = timer(() => { results.push(1); t0.stop() })
    const t1 = timer(() => { results.push(2); t1.stop() })
    const t2 = timer(() => { results.push(3); t2.stop() })
    const t3 = timer(() => {
      t3.stop()
      expect(results).toEqual([1, 2, 3])
      done()
    })
  })

  it('timer(callback, delay) invokes callbacks in scheduling order during asynchronous flush', (done) => {
    const then = now()
    let results: number[] | undefined
    const t0 = timer(() => { results = [1]; t0.stop() }, 60, then)
    const t1 = timer(() => { if (results) { results.push(2); t1.stop() } }, 40, then)
    const t2 = timer(() => { if (results) { results.push(3); t2.stop() } }, 80, then)
    const t3 = timer(() => {
      t3.stop()
      expect(results).toEqual([1, 2, 3])
      done()
    }, 100, then)
  })

  it('timer(callback) within a frame invokes the callback at the end of the same frame', (done) => {
    const then = now()
    const t0 = timer((_elapsed1: number) => {
      const d = now() - then
      const currentNow = now()
      const t1 = timer((elapsed2: number) => {
        t1.stop()
        expect(elapsed2).toBe(0)
        assertInRange(now() - then, d, d + 3)
        done()
      }, 0, currentNow)
      t0.stop()
    })
  })

  it('timer.stop() immediately stops the timer', (done) => {
    let count = 0
    const t = timer(() => { ++count })
    setTimeout(() => {
      t.stop()
      expect(count).toBe(1)
      done()
    }, 24)
  })

  it('timer.restart(callback) verifies that callback is a function', () => {
    const t = timer(() => {})
    expect(() => { (t.restart as Function)() }).toThrow(TypeError)
    expect(() => { (t.restart as Function)(null) }).toThrow(TypeError)
    expect(() => { (t.restart as Function)('42') }).toThrow(TypeError)
    t.stop()
  })

  it('timer.restart(callback) implicitly uses zero delay and the current time', (done) => {
    const t = timer(() => {}, 1000)
    t.restart((elapsed: number) => {
      assertInRange(elapsed, 17 - 10, 17 + 25)
      t.stop()
      done()
    })
  })

  it('timer.stop() immediately followed by restart() does not cause an infinite loop', (done) => {
    const t = timer(() => {})
    let last: number | undefined
    t.stop()
    t.restart((elapsed: number) => {
      if (last === undefined) { last = elapsed; return }
      if (elapsed === last) throw new Error('repeated invocation')
      t.stop()
    })
    done()
  })

  it('timer.stop() immediately followed by restart() does not cause an infinite loop (2)', (done) => {
    const t0 = timer(() => {})
    const t1 = timer(() => {})
    let last: number | undefined
    t0.stop()
    t0.restart((elapsed: number) => {
      if (last === undefined) { last = elapsed; return }
      if (elapsed === last) throw new Error('repeated invocation')
      t0.stop()
    })
    t1.stop()
    done()
  })

  it('timer.stop() clears the internal _next field after a timeout', (done) => {
    const t0 = timer(() => {})
    const t1 = timer(() => {})
    t0.stop()
    setTimeout(() => {
      expect(!t0._next).toBe(true)
      t1.stop()
      done()
    }, 100)
  })
})
