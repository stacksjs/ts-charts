import { describe, it, expect } from 'bun:test'
import { now, timer, timerFlush } from '../src/index.ts'

describe('timerFlush', () => {
  it('timerFlush() immediately invokes any eligible timers', () => {
    let count = 0
    const t = timer(() => { ++count; t.stop() })
    timerFlush()
    timerFlush()
    expect(count).toBe(1)
  })

  it('timerFlush() within timerFlush() still executes all eligible timers', () => {
    let count = 0
    const t = timer(() => { if (++count >= 3) t.stop(); timerFlush() })
    timerFlush()
    expect(count).toBe(3)
  })

  it('timerFlush() observes the current time', () => {
    const start = now()
    let foos = 0
    let bars = 0
    let bazs = 0
    const foo = timer(() => { ++foos; foo.stop() }, 0, start + 1)
    const bar = timer(() => { ++bars; bar.stop() }, 0, start)
    const baz = timer(() => { ++bazs; baz.stop() }, 0, start - 1)
    timerFlush()
    expect(foos).toBe(0)
    expect(bars).toBe(1)
    expect(bazs).toBe(1)
  })
})
