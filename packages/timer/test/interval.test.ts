import { describe, it, expect } from 'bun:test'
import { interval, now, Timer } from '../src/index.ts'
import { assertInRange } from './asserts.ts'

describe('interval', () => {
  it('interval(callback) invokes the callback about every 17ms', (done) => {
    const then = now()
    let count = 0
    const t = interval(() => {
      if (++count > 10) {
        t.stop()
        assertInRange(now() - then, (17 - 5) * count, (17 + 5) * count)
        done()
      }
    })
  })

  it('interval(callback) invokes the callback until the timer is stopped', (done) => {
    let count = 0
    const t = interval(() => {
      if (++count > 2) {
        t.stop()
        done()
      }
    })
  })

  it('interval(callback, delay) invokes the callback about every delay milliseconds', (done) => {
    const then = now()
    const delay = 50
    const nows: number[] = [then]
    const t = interval(() => {
      if (nows.push(now()) > 10) {
        t.stop()
        nows.forEach((n, i) => { assertInRange(n - then, delay * i - 20, delay * i + 20) })
        done()
      }
    }, delay)
  })

  it('interval(callback, delay, time) invokes the callback repeatedly after the specified delay relative to the given time', (done) => {
    const then = now() + 50
    const delay = 50
    const t = interval(() => {
      assertInRange(now() - then, delay - 10, delay + 10)
      t.stop()
      done()
    }, delay, then)
  })

  it('interval(callback) passes the callback the elapsed time', (done) => {
    const then = now()
    const t = interval((elapsed: number) => {
      expect(elapsed).toBe(now() - then)
      t.stop()
      done()
    }, 100)
  })

  it('interval(callback) returns a timer', (done) => {
    let count = 0
    const t = interval(() => { ++count })
    expect(t instanceof Timer).toBe(true)
    t.stop()
    setTimeout(() => {
      expect(count).toBe(0)
      done()
    }, 100)
  })

  it('interval(callback).restart restarts as an interval', (done) => {
    const then = now()
    const delay = 50
    const nows: number[] = [then]
    const callback = (): void => {
      if (nows.push(now()) > 10) {
        t.stop()
        nows.forEach((n, i) => { assertInRange(n - then, delay * i - 20, delay * i + 20) })
        done()
      }
    }
    const t = interval(callback, delay)
    t.stop()
    t.restart(callback, delay)
  })
})
