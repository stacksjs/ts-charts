import { describe, it, expect } from 'bun:test'
import { easeBounce, easeCubic } from '@ts-charts/ease'
import { select, selectAll } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import { ENDING, RUNNING } from '../../src/transition/schedule.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.ease() returns the easing function for the first non-null node', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = select(one).transition()
  const t2 = select(two).transition().ease(easeBounce)
  expect((one as any).__transition[t1._id].ease).toBe(easeCubic)
  expect((two as any).__transition[t2._id].ease).toBe(easeBounce)
  expect(t1.ease()).toBe(easeCubic)
  expect(t2.ease()).toBe(easeBounce)
  expect(select(one).transition(t1).ease()).toBe(easeCubic)
  expect(select(two).transition(t2).ease()).toBe(easeBounce)
  expect(selectAll([null, one]).transition(t1).ease()).toBe(easeCubic)
  expect(selectAll([null, two]).transition(t2).ease()).toBe(easeBounce)
})

jsdomit('transition.ease(ease) throws an error if ease is not a function', () => {
  const root = document.documentElement
  const t = select(root).transition()
  expect(() => { t.ease(42 as any) }).toThrow()
  expect(() => { t.ease(null as any) }).toThrow()
})

jsdomit('transition.ease(ease) sets the easing function for each selected element to the specified function', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t = selectAll([one, two]).transition().ease(easeBounce)
  expect((one as any).__transition[t._id].ease).toBe(easeBounce)
  expect((two as any).__transition[t._id].ease).toBe(easeBounce)
})

jsdomit('transition.ease(ease) passes the easing function the normalized time in [0, 1]', async () => {
  let actual: number
  const root = document.documentElement
  const ease = (t: number): number => { actual = t; return t }

  select(root).transition().ease(ease)

  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(actual!).toBe(elapsed / 250)
    resolve()
  }, 100))
})

jsdomit('transition.ease(ease) does not invoke the easing function on the last frame', async () => {
  const root = document.documentElement
  const ease = (t: number): number => { expect(schedule.state).toBe(RUNNING); return t }
  const t = select(root).transition().ease(ease)
  const schedule = (root as any).__transition[t._id]
  await t.end()
})

jsdomit('transition.ease(ease) observes the eased time returned by the easing function', async () => {
  const root = document.documentElement
  let expected: number
  const ease = (): number => { return expected = Math.random() * 2 - 0.5 }
  const tween = (): (t: number) => void => { return (t: number) => { expect(t).toBe(schedule.state === ENDING ? 1 : expected) } }
  const t = select(root).transition().ease(ease).tween('tween', tween)
  const schedule = (root as any).__transition[t._id]
  await t.end()
})
