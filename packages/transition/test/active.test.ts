import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import { active } from '../src/index.ts'
import jsdomit from './jsdom.ts'

jsdomit('active(node) returns null if the specified node has no active transition with the null name', async () => {
  const root = document.documentElement
  const s = select(root)

  expect(active(root)).toBe(null)

  s.transition().delay(50).duration(50)
  s.transition('foo').duration(50)
  expect(active(root)).toBe(null)

  await new Promise<void>(resolve => timeout(() => {
    expect(active(root)).toBe(null)
    resolve()
  }))

  await new Promise<void>(resolve => timeout(() => {
    expect(active(root)).toBe(null)
    resolve()
  }, 100))
})

jsdomit('active(node, null) returns null if the specified node has no active transition with the null name', async () => {
  const root = document.documentElement
  const s = select(root)

  expect(active(root, null)).toBe(null)

  s.transition().delay(50).duration(50)
  s.transition('foo').duration(50)
  expect(active(root, null)).toBe(null)

  await new Promise<void>(resolve => timeout(() => {
    expect(active(root, null)).toBe(null)
    resolve()
  }))

  await new Promise<void>(resolve => timeout(() => {
    expect(active(root, null)).toBe(null)
    resolve()
  }, 100))
})

jsdomit('active(node, undefined) returns null if the specified node has no active transition with the null name', async () => {
  const root = document.documentElement
  const s = select(root)

  expect(active(root, undefined)).toBe(null)

  s.transition().delay(50).duration(50)
  s.transition('foo').duration(50)
  expect(active(root, undefined)).toBe(null)

  await new Promise<void>(resolve => timeout(() => {
    expect(active(root, undefined)).toBe(null)
    resolve()
  }))

  await new Promise<void>(resolve => timeout(() => {
    expect(active(root, undefined)).toBe(null)
    resolve()
  }, 100))
})

jsdomit('active(node, name) returns null if the specified node has no active transition with the specified name', async () => {
  const root = document.documentElement
  const s = select(root)

  expect(active(root, 'foo')).toBe(null)

  s.transition('foo').delay(50).duration(50)
  s.transition().duration(50)
  expect(active(root, null)).toBe(null)

  expect(active(root, 'foo')).toBe(null)

  await new Promise<void>(resolve => timeout(() => {
    expect(active(root, 'foo')).toBe(null)
    resolve()
  }))

  await new Promise<void>(resolve => timeout(() => {
    expect(active(root, 'foo')).toBe(null)
    resolve()
  }, 100))
})

jsdomit('active(node) returns the active transition on the specified node with the null name', async () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition().on('start', check).tween('tween', tweened).on('end', check)

  function check(): void {
    const a = active(root)!
    expect(a._groups).toEqual([[root]])
    expect(a._parents).toEqual([null])
    expect(a._name).toBe(null)
    expect(a._id).toBe(t._id)
  }

  function tweened(): (t: number) => void {
    check()
    return (t: number) => {
      if (t >= 1) check()
    }
  }

  await t.end()
})

jsdomit('active(node, name) returns the active transition on the specified node with the specified name', async () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition('foo').on('start', check).tween('tween', tweened).on('end', check)

  function check(): void {
    const a = active(root, 'foo')!
    expect(a._groups).toEqual([[root]])
    expect(a._parents).toEqual([null])
    expect(a._name).toBe('foo')
    expect(a._id).toBe(t._id)
  }

  function tweened(): (t: number) => void {
    check()
    return (t: number) => {
      if (t >= 1) check()
    }
  }

  await t.end()
})
