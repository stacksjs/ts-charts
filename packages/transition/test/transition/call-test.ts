import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.call() works like selection.call', () => {
  const root = document.documentElement
  let called = false
  const t = select(root).transition()
  const result = t.call((t: any) => { called = true })
  expect(called).toBe(true)
  expect(result).toBe(t)
})
