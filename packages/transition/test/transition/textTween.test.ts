import { describe, it, expect } from 'bun:test'
import { easeCubic } from '@ts-charts/ease'
import { interpolateHcl } from '@ts-charts/interpolate'
import { select } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.textTween(value) defines a text tween using the interpolator returned by the specified function', async () => {
  const root = document.documentElement
  const interpolate = interpolateHcl('red', 'blue')
  const ease = easeCubic
  select(root).transition().textTween(() => interpolate)
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.textContent).toBe(interpolate(ease(elapsed / 250)))
    resolve()
  }, 125))
})

jsdomit('transition.textTween() returns the existing text tween', () => {
  const root = document.documentElement
  const factory = () => {}
  const t = select(root).transition().textTween(factory)
  expect(t.textTween()).toBe(factory)
})

jsdomit('transition.textTween(null) removes an existing text tween', () => {
  const root = document.documentElement
  const factory = () => {}
  const t = select(root).transition().textTween(factory)
  t.textTween(undefined)
  expect(t.textTween()).toBe(null)
})
