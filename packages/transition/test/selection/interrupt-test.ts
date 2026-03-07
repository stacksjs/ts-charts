import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import { CREATED, ENDED, ENDING, SCHEDULED, STARTED, STARTING } from '../../src/transition/schedule.ts'
import jsdomit from '../jsdom.ts'

jsdomit('selection.interrupt() returns the selection', () => {
  const s = select(document)
  expect(s.interrupt()).toBe(s)
})

jsdomit('selection.interrupt() cancels any pending transitions on the selected elements', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition()
  const t2 = t1.transition()
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(true)
  expect(s.interrupt()).toBe(s)
  expect((root as any).__transition).toBe(undefined)
})

jsdomit('selection.interrupt() only cancels pending transitions with the null name', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition('foo')
  const t2 = s.transition()
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(true)
  expect(s.interrupt()).toBe(s)
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(false)
})

jsdomit('selection.interrupt(null) only cancels pending transitions with the null name', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition('foo')
  const t2 = s.transition()
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(true)
  expect(s.interrupt(null as any)).toBe(s)
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(false)
})

jsdomit('selection.interrupt(undefined) only cancels pending transitions with the null name', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition('foo')
  const t2 = s.transition()
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(true)
  expect(s.interrupt(undefined)).toBe(s)
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(false)
})

jsdomit('selection.interrupt(name) only cancels pending transitions with the specified name', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition('foo')
  const t2 = s.transition()
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(true)
  expect(s.interrupt('foo')).toBe(s)
  expect(t1._id in (root as any).__transition).toBe(false)
  expect(t2._id in (root as any).__transition).toBe(true)
})

jsdomit('selection.interrupt(name) coerces the name to a string', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition('foo')
  const t2 = s.transition()
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(true)
  expect(s.interrupt({ toString() { return 'foo' } } as any)).toBe(s)
  expect(t1._id in (root as any).__transition).toBe(false)
  expect(t2._id in (root as any).__transition).toBe(true)
})

jsdomit('selection.interrupt() does nothing if there is no transition on the selected elements', () => {
  const root = document.documentElement
  const s = select(root)
  expect((root as any).__transition).toBe(undefined)
  expect(s.interrupt()).toBe(s)
  expect((root as any).__transition).toBe(undefined)
})

jsdomit('selection.interrupt() dispatches an interrupt event to the started transition on the selected elements', async () => {
  const root = document.documentElement
  let interrupts = 0
  const s = select(root)
  const t = s.transition().on('interrupt', () => { ++interrupts })
  await new Promise<void>(resolve => timeout(() => {
    const schedule = (root as any).__transition[t._id]
    expect(schedule.state).toBe(STARTED)
    s.interrupt()
    expect(schedule.timer._call).toBe(null)
    expect(schedule.state).toBe(ENDED)
    expect((root as any).__transition).toBe(undefined)
    expect(interrupts).toBe(1)
    resolve()
  }))
})

jsdomit('selection.interrupt() destroys the schedule after dispatching the interrupt event', async () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition().on('interrupt', interrupted)
  await new Promise<void>(resolve => timeout(() => {
    s.interrupt()
    resolve()
  }))
  function interrupted(): void {
    expect(t.delay()).toBe(0)
    expect(t.duration()).toBe(250)
    expect(t.on('interrupt')).toBe(interrupted)
  }
})

jsdomit('selection.interrupt() does not dispatch an interrupt event to a starting transition', async () => {
  const root = document.documentElement
  let interrupts = 0
  const s = select(root)
  const t = s.transition().on('interrupt', () => { ++interrupts })
  await new Promise<void>(resolve => t.on('start', () => {
    const schedule = (root as any).__transition[t._id]
    expect(schedule.state).toBe(STARTING)
    s.interrupt()
    expect(schedule.timer._call).toBe(null)
    expect(schedule.state).toBe(ENDED)
    expect((root as any).__transition).toBe(undefined)
    expect(interrupts).toBe(0)
    resolve()
  }))
})

jsdomit('selection.interrupt() prevents a created transition from starting', async () => {
  const root = document.documentElement
  let starts = 0
  const s = select(root)
  const t = s.transition().on('start', () => { ++starts })
  const schedule = (root as any).__transition[t._id]
  expect(schedule.state).toBe(CREATED)
  s.interrupt()
  expect(schedule.timer._call).toBe(null)
  expect(schedule.state).toBe(ENDED)
  expect((root as any).__transition).toBe(undefined)
  await new Promise<void>(resolve => timeout(resolve, 10))
  expect(starts).toBe(0)
})

jsdomit('selection.interrupt() prevents a scheduled transition from starting', async () => {
  const root = document.documentElement
  let starts = 0
  const s = select(root)
  const t = s.transition().delay(50).on('start', () => { ++starts })
  const schedule = (root as any).__transition[t._id]
  await new Promise<void>(resolve => timeout(resolve))
  expect(schedule.state).toBe(SCHEDULED)
  s.interrupt()
  expect(schedule.timer._call).toBe(null)
  expect(schedule.state).toBe(ENDED)
  expect((root as any).__transition).toBe(undefined)
  await new Promise<void>(resolve => timeout(resolve, 60))
  expect(starts).toBe(0)
})

jsdomit('selection.interrupt() prevents a starting transition from initializing tweens', async () => {
  const root = document.documentElement
  let tweens = 0
  const s = select(root)
  const t = s.transition().tween('tween', () => { ++tweens })
  const schedule = (root as any).__transition[t._id]
  await new Promise<void>(resolve => t.on('start', () => {
    expect(schedule.state).toBe(STARTING)
    s.interrupt()
    expect(schedule.timer._call).toBe(null)
    expect(schedule.state).toBe(ENDED)
    expect((root as any).__transition).toBe(undefined)
    resolve()
  }))
  await new Promise<void>(resolve => timeout(resolve, 10))
  expect(tweens).toBe(0)
})

jsdomit('selection.interrupt() during tween initialization prevents an active transition from continuing', async () => {
  const root = document.documentElement
  let tweens = 0
  const s = select(root)
  const t = s.transition().tween('tween', () => { s.interrupt(); return () => { ++tweens } })
  const schedule = (root as any).__transition[t._id]
  await new Promise<void>(resolve => timeout(resolve, 10))
  expect(schedule.timer._call).toBe(null)
  expect(schedule.state).toBe(ENDED)
  expect((root as any).__transition).toBe(undefined)
  expect(tweens).toBe(0)
})

jsdomit('selection.interrupt() prevents an active transition from continuing', async () => {
  const root = document.documentElement
  let interrupted = false
  let tweens = 0
  const s = select(root)
  const t = s.transition().tween('tween', () => () => { if (interrupted) ++tweens })
  const schedule = (root as any).__transition[t._id]
  await new Promise<void>(resolve => timeout(() => {
    interrupted = true
    expect(schedule.state).toBe(STARTED)
    s.interrupt()
    expect(schedule.timer._call).toBe(null)
    expect(schedule.state).toBe(ENDED)
    expect((root as any).__transition).toBe(undefined)
    resolve()
  }, 10))
  await new Promise<void>(resolve => timeout(resolve, 50))
  expect(tweens).toBe(0)
})

jsdomit('selection.interrupt() during the final tween invocation prevents the end event from being dispatched', async () => {
  const root = document.documentElement
  let ends = 0
  const s = select(root)
  const t = s.transition().duration(50).tween('tween', tween).on('end', () => { ++ends })
  const schedule = (root as any).__transition[t._id]
  function tween(): (t: number) => void {
    return (t: number) => {
      if (t >= 1) {
        expect(schedule.state).toBe(ENDING)
        s.interrupt()
      }
    }
  }
  await new Promise<void>(resolve => timeout(() => {
    expect(schedule.timer._call).toBe(null)
    expect(schedule.state).toBe(ENDED)
    expect((root as any).__transition).toBe(undefined)
    expect(ends).toBe(0)
    resolve()
  }, 60))
})

jsdomit('selection.interrupt() has no effect on an ended transition', async () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition().duration(50)
  const schedule = (root as any).__transition[t._id]
  await t.end()
  expect(schedule.state).toBe(ENDED)
  expect(schedule.timer._call).toBe(null)
  s.interrupt()
  expect(schedule.state).toBe(ENDED)
  expect(schedule.timer._call).toBe(null)
  expect((root as any).__transition).toBe(undefined)
})

jsdomit('selection.interrupt() has no effect on an interrupting transition', async () => {
  const root = document.documentElement
  let interrupts = 0
  const s = select(root)
  const t = s.transition().duration(50).on('interrupt', interrupted)
  const schedule = (root as any).__transition[t._id]

  function interrupted(): void {
    ++interrupts
    s.interrupt()
  }

  await new Promise<void>(resolve => timeout(() => {
    expect(schedule.state).toBe(STARTED)
    s.interrupt()
    expect(schedule.state).toBe(ENDED)
    expect(schedule.timer._call).toBe(null)
    expect(interrupts).toBe(1)
    resolve()
  }))
})
