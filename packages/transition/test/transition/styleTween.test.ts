import { describe, it, expect } from 'bun:test'
import { easeCubic } from '@ts-charts/ease'
import { interpolateHcl } from '@ts-charts/interpolate'
import { select, selectAll } from '@ts-charts/selection'
import { now, timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import { ENDING } from '../../src/transition/schedule.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.styleTween(name, value) defines a style tween using the interpolator returned by the specified function', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  const ease = easeCubic
  select(root).transition().styleTween('color', () => interpolate)
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('color')).toBe(interpolate(ease(elapsed / 250)))
    expect(root.style.getPropertyPriority('color')).toBe('')
    resolve()
  }, 125))
})

jsdomit('transition.styleTween(name, value, priority) defines a style tween using the interpolator returned by the specified function', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  const ease = easeCubic
  select(root).transition().styleTween('color', () => interpolate, 'important')
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('color')).toBe(interpolate(ease(elapsed / 250)))
    expect(root.style.getPropertyPriority('color')).toBe('important')
    resolve()
  }, 125))
})

jsdomit('transition.styleTween(name, value) invokes the value function with the expected context and arguments', '<h1 id="one"></h1><h1 id="two"></h1>', async () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const result: any[] = []
  selectAll([one, two]).data(['one', 'two']).transition().styleTween('color', function (this: any, d: any, i: number, nodes: any[]) { result.push([d, i, nodes, this]) })
  await new Promise<void>(resolve => timeout(() => resolve()))
  expect(result).toEqual([
    ['one', 0, [one, two], one],
    ['two', 1, [one, two], two],
  ])
})

jsdomit('transition.styleTween(name, value) passes the eased time to the interpolator', async () => {
  const root = document.documentElement
  const then = now()
  const duration = 250
  const ease = easeCubic
  const t = select(root).transition().styleTween('color', () => interpolate)
  const schedule = (root as any).__transition[t._id]
  function interpolate(this: any, t: number): void {
    expect(this).toBe(root)
    expect(t).toBe(schedule.state === ENDING ? 1 : ease((now() - then) / duration))
  }
  await t.end()
})

jsdomit('transition.styleTween(name, value) allows the specified function to return null for a noop', async () => {
  const root = document.documentElement
  const s = select(root).style('color', 'red')
  s.transition().styleTween('color', () => {})
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('color')).toBe('red')
    resolve()
  }, 125))
})

jsdomit('transition.styleTween(name, value) coerces the specified name to a string', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  const ease = easeCubic
  select(root).transition().styleTween({ toString() { return 'color' } } as any, () => interpolate)
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('color')).toBe(interpolate(ease(elapsed / 250)))
    resolve()
  }, 125))
})

jsdomit('transition.styleTween(name, value) throws an error if value is not null and not a function', async () => {
  const root = document.documentElement
  const t = select(root).transition()
  expect(() => { t.styleTween('color', 42 as any) }).toThrow()
})

jsdomit('transition.styleTween(name, null) removes the specified style tween', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  const t = select(root).transition().styleTween('color', () => interpolate).styleTween('color', null)
  expect(t.styleTween('color')).toBe(null)
  expect(t.tween('style.color')).toBe(null)
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('color')).toBe('')
    resolve()
  }, 125))
})

jsdomit('transition.styleTween(name) returns the style tween with the specified name', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  const tween = () => interpolate
  const started = () => { expect(t.styleTween('color')).toBe(tween) }
  const ended = () => { expect(t.styleTween('color')).toBe(tween) }
  const t = select(root).transition().styleTween('color', tween).on('start', started).on('end', ended)
  expect(t.styleTween('color')).toBe(tween)
  expect(t.styleTween('bar')).toBe(null)
  await t.end()
})

jsdomit('transition.styleTween(name) coerces the specified name to a string', async () => {
  const root = document.documentElement
  const tween = () => {}
  const t = select(root).transition().styleTween('color', tween)
  expect(t.styleTween({ toString() { return 'color' } } as any)).toBe(tween)
})
