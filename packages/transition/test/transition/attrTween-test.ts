import { describe, it, expect } from 'bun:test'
import { easeCubic } from '@ts-charts/ease'
import { interpolateHcl } from '@ts-charts/interpolate'
import { select, selectAll } from '@ts-charts/selection'
import { timeout, now } from '@ts-charts/timer'
import '../../src/index.ts'
import { ENDING } from '../../src/transition/schedule.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.attrTween(name, value) defines an attribute tween using the interpolator returned by the specified function', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  select(root).transition().attrTween('foo', () => interpolate)
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.getAttribute('foo')).toBe(interpolate(easeCubic(elapsed / 250)))
    resolve()
  }, 125))
})

jsdomit('transition.attrTween(name, value) invokes the value function with the expected context and arguments', '<h1 id="one"></h1><h1 id="two"></h1>', async () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const result: any[] = []
  selectAll([one, two]).data(['one', 'two']).transition().attrTween('foo', function (this: any, d: any, i: number, nodes: any[]) { result.push([d, i, nodes, this]) })
  await new Promise<void>(resolve => timeout(resolve))
  expect(result).toEqual([
    ['one', 0, [one, two], one],
    ['two', 1, [one, two], two],
  ])
})

jsdomit('transition.attrTween(name, value) passes the eased time to the interpolator', async () => {
  const root = document.documentElement
  const then = now()
  const duration = 250
  const ease = easeCubic
  const t = select(root).transition().attrTween('foo', () => interpolate)
  const schedule = (root as any).__transition[t._id]
  function interpolate(this: any, t: number): void {
    expect(this).toBe(root)
    expect(t).toBe(schedule.state === ENDING ? 1 : ease((now() - then) / duration))
  }
  await t.end()
})

jsdomit('transition.attrTween(name, value) allows the specified function to return null for a noop', async () => {
  const root = document.documentElement
  const s = select(root).attr('foo', '42').attr('svg:bar', '43')
  s.transition().attrTween('foo', () => {}).attrTween('svg:bar', () => {})
  await new Promise<void>(resolve => timeout(resolve, 125))
  expect(root.getAttribute('foo')).toBe('42')
  expect(root.getAttributeNS('http://www.w3.org/2000/svg', 'bar')).toBe('43')
})

jsdomit('transition.attrTween(name, value) defines a namespaced attribute tween using the interpolator returned by the specified function', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  select(root).transition().attrTween('svg:foo', () => interpolate)
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.getAttributeNS('http://www.w3.org/2000/svg', 'foo')).toBe(interpolate(easeCubic(elapsed / 250)))
    resolve()
  }, 125))
})

jsdomit('transition.attrTween(name, value) coerces the specified name to a string', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  select(root).transition().attrTween({ toString() { return 'foo' } } as any, () => interpolate)
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.getAttribute('foo')).toBe(interpolate(easeCubic(elapsed / 250)))
    resolve()
  }, 125))
})

jsdomit('transition.attrTween(name, value) throws an error if value is not null and not a function', async () => {
  const root = document.documentElement
  const t = select(root).transition()
  expect(() => { t.attrTween('foo', 42 as any) }).toThrow()
})

jsdomit('transition.attrTween(name, null) removes the specified attribute tween', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  const t = select(root).transition().attrTween('foo', () => interpolate).attrTween('foo', null)
  expect(t.attrTween('foo')).toBe(null)
  expect(t.tween('attr.foo')).toBe(null)
  await new Promise<void>(resolve => timeout(resolve, 125))
  expect(root.hasAttribute('foo')).toBe(false)
})

jsdomit('transition.attrTween(name) returns the attribute tween with the specified name', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  const tween = () => interpolate
  const started = () => expect(t.attrTween('foo')).toBe(tween)
  const ended = () => expect(t.attrTween('foo')).toBe(tween)
  const t = select(root).transition().attrTween('foo', tween).on('start', started).on('end', ended)
  expect(t.attrTween('foo')).toBe(tween)
  expect(t.attrTween('bar')).toBe(null)
  await t.end()
})

jsdomit('transition.attrTween(name) coerces the specified name to a string', async () => {
  const root = document.documentElement
  const tween = () => {}
  const t = select(root).transition().attrTween('color', tween)
  expect(t.attrTween({ toString() { return 'color' } } as any)).toBe(tween)
})
