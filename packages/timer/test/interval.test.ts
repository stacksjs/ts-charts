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

  it.each([
    ['interval(callback, delay)', false],
    ['interval(callback).restart', true],
  ] as const)('%s schedules each callback relative to the original start time', async (_, restart) => {
    const then = now()
    const delay = 50
    const ticks: { at: number, next: number }[] = []
    const observed = Promise.withResolvers<void>()
    const callback = () => {
      if (ticks.push({ at: now(), next: t._time }) === 10) {
        t.stop()
        observed.resolve()
      }
    }
    const t = interval(callback, delay)
    try {
      if (restart) {
        t.stop()
        t.restart(callback, delay)
      }
      await observed.promise
      for (const [index, tick] of ticks.entries()) {
        expect(tick.at).toBeGreaterThanOrEqual(then + (index + 1) * delay)
        expect(tick.next).toBeCloseTo(then + (index + 2) * delay, 9)
      }
    }
    finally { t.stop() }
  })

  it('interval(callback, delay, time) invokes the callback repeatedly after the specified delay relative to the given time', async () => {
    const then = now() + 50
    const delay = 50
    const ticks: number[] = []
    const observed = Promise.withResolvers<void>()
    const t = interval(() => {
      if (ticks.push(now()) === 2) {
        t.stop()
        observed.resolve()
      }
    }, delay, then)
    try {
      expect(t._time).toBe(then + delay)
      await observed.promise
      expect(ticks[0]).toBeGreaterThanOrEqual(then + delay)
      expect(ticks[1]).toBeGreaterThanOrEqual(then + 2 * delay)
    }
    finally { t.stop() }
  })

  it('interval(callback) passes the callback the elapsed time', (done) => {
    const then = now()
    const t = interval((elapsed: number) => {
      t.stop()
      expect(elapsed).toBeCloseTo(now() - then, 9)
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
})
