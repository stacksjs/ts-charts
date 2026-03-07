import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../src/index.ts'
import jsdomit from './jsdom.ts'

// Note: In Bun, uncaught exceptions in timers behave differently than Node.
// These tests verify that transitions clean up after errors.

jsdomit('transition.on("start", error) terminates the transition', async () => {
  const root = document.documentElement
  const s = select(root)
  s.transition().on('start', () => { throw new Error() })
  await new Promise<void>(resolve => timeout(() => resolve()))
  expect((root as any).__transition).toBe(undefined)
})

jsdomit('transition.tween("foo", error) terminates the transition', async () => {
  const root = document.documentElement
  const s = select(root)
  s.transition().tween('foo', () => { throw new Error() })
  await new Promise<void>(resolve => timeout(() => resolve()))
  expect((root as any).__transition).toBe(undefined)
})

jsdomit('transition.tween("foo", deferredError) terminates the transition', async () => {
  const root = document.documentElement
  const s = select(root)
  s.transition().duration(50).tween('foo', () => { return function (t: number): void { if (t === 1) throw new Error() } })
  await new Promise<void>(resolve => timeout(() => resolve(), 50))
  expect((root as any).__transition).toBe(undefined)
})

jsdomit('transition.on("end", error) terminates the transition', async () => {
  const root = document.documentElement
  const s = select(root)
  s.transition().delay(50).duration(50).on('end', () => { throw new Error() })
  await new Promise<void>(resolve => timeout(() => resolve(), 100))
  expect((root as any).__transition).toBe(undefined)
})
