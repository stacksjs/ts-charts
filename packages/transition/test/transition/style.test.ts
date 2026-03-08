import { describe, it, expect } from 'bun:test'
import { easeCubic } from '@ts-charts/ease'
import { interpolateNumber, interpolateRgb, interpolateString } from '@ts-charts/interpolate'
import { select, selectAll } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.style(name, value) creates an tween to the specified value', async () => {
  const root = document.documentElement
  const ease = easeCubic
  const duration = 250
  const interpolate = interpolateRgb('red', 'blue')
  const s = select(root).style('color', 'red')
  s.transition().style('color', 'blue')
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('color')).toBe(interpolate(ease(elapsed / duration)))
    resolve()
  }, 125))
})

jsdomit('transition.style(name, value) creates an tween to the value returned by the specified function', async () => {
  const root = document.documentElement
  const ease = easeCubic
  const duration = 250
  const interpolate = interpolateRgb('red', 'blue')
  const s = select(root).style('color', 'red')
  s.transition().style('color', () => 'blue')
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('color')).toBe(interpolate(ease(elapsed / duration)))
    resolve()
  }, 125))
})

jsdomit('transition.style(name, value) immediately evaluates the specified function with the expected context and arguments', '<h1 id="one" style="color:#0ff;"></h1><h1 id="two" style="color:#f0f;"></h1>', async () => {
  const one = document.querySelector('#one')! as HTMLElement
  const two = document.querySelector('#two')! as HTMLElement
  const ease = easeCubic
  const duration = 250
  const interpolate1 = interpolateRgb('cyan', 'red')
  const interpolate2 = interpolateRgb('magenta', 'green')
  const t = selectAll([one, two]).data(['red', 'green'])
  const result: any[] = []
  t.transition().style('color', function (this: any, d: any, i: number, nodes: any[]) { result.push([d, i, nodes, this]); return d })
  expect(result).toEqual([
    ['red', 0, [one, two], one],
    ['green', 1, [one, two], two],
  ])
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(one.style.getPropertyValue('color')).toBe(interpolate1(ease(elapsed / duration)))
    expect(two.style.getPropertyValue('color')).toBe(interpolate2(ease(elapsed / duration)))
    resolve()
  }, 125))
})

jsdomit('transition.style(name, value) recycles tweens', '<h1 id="one" style="color:#f0f;"></h1><h1 id="two" style="color:#f0f;"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t = selectAll([one, two]).transition().style('color', 'red')
  expect((one as any).__transition[t._id].tween).toBe((two as any).__transition[t._id].tween)
})

jsdomit('transition.style(name, value) constructs an interpolator using the current value on start', async () => {
  const root = document.documentElement
  const ease = easeCubic
  const duration = 250
  const interpolate = interpolateRgb('red', 'blue')
  const s = select(root)
  s.transition().on('start', () => { s.style('color', 'red') }).style('color', () => 'blue')
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('color')).toBe(interpolate(ease(elapsed / duration)))
    resolve()
  }, 125))
})

jsdomit('transition.style(name, null) creates an tween which removes the specified style post-start', async () => {
  const root = document.documentElement
  const started = () => expect(root.style.getPropertyValue('color')).toBe('red')
  const s = select(root).style('color', 'red')
  s.transition().style('color', null).on('start', started)
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('color')).toBe('')
    resolve()
  }))
})

jsdomit('transition.style(name, null) creates an tween which removes the specified style post-start (function)', async () => {
  const root = document.documentElement
  const started = () => expect(root.style.getPropertyValue('color')).toBe('red')
  const s = select(root).style('color', 'red')
  s.transition().style('color', () => null).on('start', started)
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('color')).toBe('')
    resolve()
  }))
})

jsdomit('transition.style(name, value) creates an tween which removes the specified style post-start if the specified function returns null', async () => {
  const root = document.documentElement
  const started = () => expect(root.style.getPropertyValue('color')).toBe('red')
  const s = select(root).style('color', 'red')
  s.transition().style('color', function () {}).on('start', started)
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('color')).toBe('')
    resolve()
  }))
})

jsdomit('transition.style(name, constant) is a noop if the string-coerced value matches the current value on tween initialization', async () => {
  const root = document.documentElement
  const s = select(root).style('opacity', 1 as any)
  s.transition().style('opacity', 1)
  timeout(() => { root.style.opacity = '0.5' }, 125)
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('opacity')).toBe('0.5')
    resolve()
  }, 250))
})

jsdomit('transition.style(name, function) is a noop if the string-coerced value matches the current value on tween initialization', async () => {
  const root = document.documentElement
  const s = select(root).style('opacity', 1 as any)
  s.transition().style('opacity', function () { return 1 })
  timeout(() => { root.style.opacity = '0.5' }, 125)
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('opacity')).toBe('0.5')
    resolve()
  }, 250))
})

jsdomit('transition.style(name, value) interpolates numbers', async () => {
  const root = document.documentElement
  const ease = easeCubic
  const duration = 250
  const interpolate = interpolateNumber(0, 1)
  const s = select(root).style('opacity', 0 as any)
  s.transition().style('opacity', 1)
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('opacity')).toBe(interpolate(ease(elapsed / duration)) + '')
    resolve()
  }, 125))
})

jsdomit('transition.style(name, constant) uses interpolateNumber if value is a number', async () => {
  const root = document.documentElement
  const s = select(root).style('font-size', '15px')
  s.transition().style('font-size', 10)
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('font-size')).toBe('15px')
    resolve()
  }, 125))
})

jsdomit('transition.style(name, function) uses interpolateNumber if value is a number', async () => {
  const root = document.documentElement
  const s = select(root).style('font-size', '15px')
  s.transition().style('font-size', () => 10)
  await new Promise<void>(resolve => timeout(() => {
    expect(root.style.getPropertyValue('font-size')).toBe('15px')
    resolve()
  }, 125))
})

jsdomit('transition.style(name, value) interpolates strings', async () => {
  const root = document.documentElement
  const ease = easeCubic
  const duration = 250
  const interpolate = interpolateString('1px', '2px')
  const s = select(root).style('font-size', '1px')
  s.transition().style('font-size', '2px')
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('font-size')).toBe(interpolate(ease(elapsed / duration)))
    resolve()
  }, 125))
})

jsdomit('transition.style(name, value) interpolates colors', async () => {
  const root = document.documentElement
  const ease = easeCubic
  const duration = 250
  const interpolate = interpolateRgb('#f00', '#00f')
  const s = select(root).style('color', '#f00')
  s.transition().style('color', '#00f')
  await new Promise<void>(resolve => timeout((elapsed: number) => {
    expect(root.style.getPropertyValue('color')).toBe(interpolate(ease(elapsed / duration)))
    resolve()
  }, 125))
})

jsdomit('transition.style(name, value) creates an styleTween with the specified name', async () => {
  const root = document.documentElement
  const s = select(root).style('color', 'red')
  const t = s.transition().style('color', 'blue')
  expect(t.styleTween('color')!.call(root).call(root, 0.5)).toBe('rgb(128, 0, 128)')
})

jsdomit('transition.style(name, value) creates a tween with the name "style.name"', async () => {
  const root = document.documentElement
  const s = select(root).style('color', 'red')
  const t = s.transition().style('color', 'blue')
  t.tween('style.color')!.call(root).call(root, 0.5)
  expect(root.style.getPropertyValue('color')).toBe('rgb(128, 0, 128)')
})
