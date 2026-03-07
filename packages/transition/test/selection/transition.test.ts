import { describe, it, expect } from 'bun:test'
import { easeBounce, easeCubic } from '@ts-charts/ease'
import { select, selectAll } from '@ts-charts/selection'
import { now, timeout } from '@ts-charts/timer'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('selection.transition() returns an instanceof transition', () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition()
  expect(t instanceof transition).toBe(true)
})

jsdomit('selection.transition() uses the default timing parameters', () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition()
  const schedule = (root as any).__transition[t._id]
  expect(schedule.time).toBe(now())
  expect(schedule.delay).toBe(0)
  expect(schedule.duration).toBe(250)
  expect(schedule.ease).toBe(easeCubic)
})

jsdomit('selection.transition() assigns a monotonically-increasing id', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition()
  const t2 = s.transition()
  const t3 = s.transition()
  expect(t2._id > t1._id).toBe(true)
  expect(t3._id > t2._id).toBe(true)
})

jsdomit('selection.transition() uses a default name of null', () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition()
  const schedule = (root as any).__transition[t._id]
  expect(schedule.name).toBe(null)
})

jsdomit('selection.transition(null) uses a name of null', () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition(null as any)
  const schedule = (root as any).__transition[t._id]
  expect(schedule.name).toBe(null)
})

jsdomit('selection.transition(undefined) uses a name of null', () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition(undefined)
  const schedule = (root as any).__transition[t._id]
  expect(schedule.name).toBe(null)
})

jsdomit('selection.transition(name) uses the specified name', () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition('foo')
  const schedule = (root as any).__transition[t._id]
  expect(schedule.name).toBe('foo')
})

jsdomit('selection.transition(name) coerces the name to a string', () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition({ toString() { return 'foo' } } as any)
  const schedule = (root as any).__transition[t._id]
  expect(schedule.name).toBe('foo')
})

jsdomit('selection.transition(transition) inherits the id, name and timing from the corresponding parent in the specified transition', '<h1 id="one"><child></child></h1><h1 id="two"><child></child></h1>', async () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const s = selectAll([one, two])
  const t = s.transition().delay(function (this: any, d: any, i: number) { return i * 50 }).duration(100).ease(easeBounce)
  const schedule1 = (one as any).__transition[t._id]
  const schedule2 = (two as any).__transition[t._id]
  const t1b = select(one.firstChild!).transition(t)
  const schedule1b = (one.firstChild as any).__transition[t._id]
  expect(t1b._id).toBe(t._id)
  expect(schedule1b.name).toBe(schedule1.name)
  expect(schedule1b.delay).toBe(schedule1.delay)
  expect(schedule1b.duration).toBe(schedule1.duration)
  expect(schedule1b.ease).toBe(schedule1.ease)
  expect(schedule1b.time).toBe(schedule1.time)
  await new Promise<void>(resolve => timeout(() => resolve(), 10))
  const t2b = select(two.firstChild!).transition(t)
  const schedule2b = (two.firstChild as any).__transition[t._id]
  expect(t2b._id).toBe(t._id)
  expect(schedule2b.name).toBe(schedule2.name)
  expect(schedule2b.delay).toBe(schedule2.delay)
  expect(schedule2b.duration).toBe(schedule2.duration)
  expect(schedule2b.ease).toBe(schedule2.ease)
  expect(schedule2b.time).toBe(schedule2.time)
})

jsdomit('selection.transition(transition) reselects the existing transition with the specified transition\'s id, if any', () => {
  const root = document.documentElement
  const foo = () => {}
  const bar = () => {}
  const s = select(root)
  const t1 = s.transition().tween('tween', foo)
  const schedule1 = (root as any).__transition[t1._id]
  const t2 = s.transition(t1).tween('tween', bar)
  const schedule2 = (root as any).__transition[t2._id]
  expect(t1._id).toBe(t2._id)
  expect(schedule1).toBe(schedule2)
  expect(t1.tween('tween')).toBe(bar)
  expect(t2.tween('tween')).toBe(bar)
})

jsdomit('selection.transition(transition) throws an error if the specified transition is not found', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = select(one).transition()
  const t2 = select(two).transition().delay(50)
  expect(() => select(two).transition(t1)).toThrow(/transition .* not found/)
  expect(() => select(one).transition(t2)).toThrow(/transition .* not found/)
})
