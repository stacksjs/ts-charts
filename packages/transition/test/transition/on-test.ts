import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import { ENDED, ENDING, STARTING } from '../../src/transition/schedule.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.on(type, listener) throws an error if listener is not a function', async () => {
  const root = document.documentElement
  const t = select(root).transition()
  expect(() => { t.on('start', 42 as any) }).toThrow()
})

jsdomit('transition.on(typename) returns the listener with the specified typename, if any', async () => {
  const root = document.documentElement
  const foo = () => {}
  const bar = () => {}
  const t = select(root).transition().on('start', foo).on('start.bar', bar)
  expect(t.on('start')).toBe(foo)
  expect(t.on('start.foo')).toBe(undefined)
  expect(t.on('start.bar')).toBe(bar)
  expect(t.on('end')).toBe(undefined)
})

jsdomit('transition.on(typename) throws an error if the specified type is not supported', async () => {
  const root = document.documentElement
  const t = select(root).transition()
  expect(() => { t.on('foo') }).toThrow()
})

jsdomit('transition.on(typename, listener) throws an error if the specified type is not supported', async () => {
  const root = document.documentElement
  const t = select(root).transition()
  expect(() => { t.on('foo', () => {}) }).toThrow()
})

jsdomit('transition.on(typename, listener) throws an error if the specified listener is not a function', async () => {
  const root = document.documentElement
  const t = select(root).transition()
  expect(() => { t.on('foo', 42 as any) }).toThrow()
})

jsdomit('transition.on(typename, null) removes the listener with the specified typename, if any', async () => {
  const root = document.documentElement
  let starts = 0
  const t = select(root).transition().on('start.foo', () => { ++starts })
  const schedule = (root as any).__transition[t._id]
  expect(t.on('start.foo', null)).toBe(t)
  expect(t.on('start.foo')).toBe(undefined)
  expect(schedule.on.on('start.foo')).toBe(undefined)
  await new Promise<void>(resolve => timeout(resolve))
  expect(starts).toBe(0)
})

jsdomit('transition.on("start", listener) registers a listener for the start event', async () => {
  const root = document.documentElement
  const t = select(root).transition()
  const schedule = (root as any).__transition[t._id]
  await new Promise<void>(resolve => t.on('start', () => {
    expect(schedule.state).toBe(STARTING)
    resolve()
  }))
})

jsdomit('transition.on("interrupt", listener) registers a listener for the interrupt event (during start)', async () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition()
  const schedule = (root as any).__transition[t._id]
  timeout(() => s.interrupt())
  await new Promise<void>(resolve => t.on('interrupt', () => {
    expect(schedule.state).toBe(ENDED)
    resolve()
  }))
})

jsdomit('transition.on("interrupt", listener) registers a listener for the interrupt event (during run)', async () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition()
  const schedule = (root as any).__transition[t._id]
  timeout(() => s.interrupt(), 50)
  await new Promise<void>(resolve => t.on('interrupt', () => {
    expect(schedule.state).toBe(ENDED)
    resolve()
  }))
})

jsdomit('transition.on("end", listener) registers a listener for the end event', async () => {
  const root = document.documentElement
  const t = select(root).transition().duration(50)
  const schedule = (root as any).__transition[t._id]
  await new Promise<void>(resolve => t.on('end', () => {
    expect(schedule.state).toBe(ENDING)
    resolve()
  }))
})

jsdomit('transition.on(typename, listener) uses copy-on-write to apply changes', '<h1 id="one"></h1><h1 id="two"></h1>', async () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const foo = () => {}
  const bar = () => {}
  const t = selectAll([one, two]).transition()
  const schedule1 = (one as any).__transition[t._id]
  const schedule2 = (two as any).__transition[t._id]
  t.on('start', foo)
  expect(schedule1.on.on('start')).toBe(foo)
  expect(schedule2.on).toBe(schedule1.on)
  t.on('start', bar)
  expect(schedule1.on.on('start')).toBe(bar)
  expect(schedule2.on).toBe(schedule1.on)
  select(two).transition(t).on('start', foo)
  expect(schedule1.on.on('start')).toBe(bar)
  expect(schedule2.on.on('start')).toBe(foo)
})
