import { describe, it, expect } from 'bun:test'
import { easeCubic } from '@ts-charts/ease'
import { select, selectAll } from '@ts-charts/selection'
import { now, timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import { ENDING } from '../../src/transition/schedule.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.tween(name, value) defines an tween using the interpolator returned by the specified function', async () => {
  const root = document.documentElement
  let value: number
  const interpolate = (t: number): void => { value = t }
  select(root).transition().tween('foo', () => interpolate)
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(value!).toBe(easeCubic(elapsed / 250))
    resolve()
  }, 125))
})

jsdomit('transition.tween(name, value) invokes the value function with the expected context and arguments', '<h1 id="one"></h1><h1 id="two"></h1>', async () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const result: any[] = []
  selectAll([one, two]).data(['one', 'two']).transition().tween('foo', function (this: any, d: any, i: number, nodes: any[]) { result.push([d, i, nodes, this]) })
  await new Promise<void>(resolve => timeout(() => resolve()))
  expect(result).toEqual([
    ['one', 0, [one, two], one],
    ['two', 1, [one, two], two],
  ])
})

jsdomit('transition.tween(name, value) passes the eased time to the interpolator', async () => {
  const root = document.documentElement
  const then = now()
  const duration = 250
  const ease = easeCubic
  const t = select(root).transition().tween('foo', () => interpolate)
  const schedule = (root as any).__transition[t._id]
  function interpolate(this: any, t: number): void {
    expect(this).toBe(root)
    expect(t).toBe(schedule.state === ENDING ? 1 : ease((now() - then) / duration))
  }
  await t.end()
})

jsdomit('transition.tween(name, value) allows the specified function to return null for a noop', async () => {
  const root = document.documentElement
  const s = select(root)
  s.transition().tween('foo', () => {})
})

jsdomit('transition.tween(name, value) uses copy-on-write to apply changes', '<h1 id="one"></h1><h1 id="two"></h1>', async () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const foo = () => {}
  const bar = () => {}
  const t = selectAll([one, two]).transition()
  const schedule1 = (one as any).__transition[t._id]
  const schedule2 = (two as any).__transition[t._id]
  t.tween('foo', foo)
  expect(schedule1.tween).toEqual([{ name: 'foo', value: foo }])
  expect(schedule2.tween).toBe(schedule1.tween)
  t.tween('foo', bar)
  expect(schedule1.tween).toEqual([{ name: 'foo', value: bar }])
  expect(schedule2.tween).toBe(schedule1.tween)
  select(two).transition(t).tween('foo', foo)
  expect(schedule1.tween).toEqual([{ name: 'foo', value: bar }])
  expect(schedule2.tween).toEqual([{ name: 'foo', value: foo }])
})

jsdomit('transition.tween(name, value) uses copy-on-write to apply removals', '<h1 id="one"></h1><h1 id="two"></h1>', async () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const foo = () => {}
  const t = selectAll([one, two]).transition()
  const schedule1 = (one as any).__transition[t._id]
  const schedule2 = (two as any).__transition[t._id]
  t.tween('foo', foo)
  expect(schedule1.tween).toEqual([{ name: 'foo', value: foo }])
  expect(schedule2.tween).toBe(schedule1.tween)
  t.tween('bar', null)
  expect(schedule1.tween).toEqual([{ name: 'foo', value: foo }])
  expect(schedule2.tween).toBe(schedule1.tween)
  t.tween('foo', null)
  expect(schedule1.tween).toEqual([])
  expect(schedule2.tween).toBe(schedule1.tween)
  select(two).transition(t).tween('foo', foo)
  expect(schedule1.tween).toEqual([])
  expect(schedule2.tween).toEqual([{ name: 'foo', value: foo }])
})

jsdomit('transition.tween(name, value) coerces the specified name to a string', async () => {
  const root = document.documentElement
  const tween = () => {}
  const t = select(root).transition().tween({ toString() { return 'foo' } } as any, tween)
  expect(t.tween('foo')).toBe(tween)
})

jsdomit('transition.tween(name) coerces the specified name to a string', async () => {
  const root = document.documentElement
  const tween = () => {}
  const t = select(root).transition().tween('foo', tween)
  expect(t.tween({ toString() { return 'foo' } } as any)).toBe(tween)
})

jsdomit('transition.tween(name, value) throws an error if value is not null and not a function', async () => {
  const root = document.documentElement
  const t = select(root).transition()
  expect(() => { t.tween('foo', 42 as any) }).toThrow()
})

jsdomit('transition.tween(name, null) removes the specified tween', async () => {
  const root = document.documentElement
  let frames = 0
  const interpolate = () => { ++frames }
  const t = select(root).transition().tween('foo', () => interpolate).tween('foo', null)
  expect(t.tween('foo')).toBe(null)
  await new Promise<void>(resolve => timeout(() => {
    expect(frames).toBe(0)
    resolve()
  }, 125))
})

jsdomit('transition.tween(name) returns the tween with the specified name', async () => {
  const root = document.documentElement
  const tween = () => {}
  const started = () => { expect(t.tween('foo')).toBe(tween) }
  const ended = () => { expect(t.tween('foo')).toBe(tween) }
  const t = select(root).transition().tween('foo', tween).on('start', started).on('end', ended)
  expect(t.tween('foo')).toBe(tween)
  expect(t.tween('bar')).toBe(null)
  await t.end()
})
