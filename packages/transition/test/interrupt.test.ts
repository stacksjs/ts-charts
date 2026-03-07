import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { interrupt } from '../src/index.ts'
import jsdomit from './jsdom.ts'

jsdomit('interrupt(node) cancels any pending transitions on the specified node', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition()
  const t2 = t1.transition()
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(true)
  interrupt(root)
  expect((root as any).__transition).toBe(undefined)
})

jsdomit('selection.interrupt(name) only cancels pending transitions with the specified name', () => {
  const root = document.documentElement
  const s = select(root)
  const t1 = s.transition('foo')
  const t2 = s.transition()
  expect(t1._id in (root as any).__transition).toBe(true)
  expect(t2._id in (root as any).__transition).toBe(true)
  interrupt(root, 'foo')
  expect(t1._id in (root as any).__transition).toBe(false)
  expect(t2._id in (root as any).__transition).toBe(true)
})
