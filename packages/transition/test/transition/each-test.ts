import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '@ts-charts/selection'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.each() runs as expected', () => {
  const root = document.documentElement
  let a = 0
  select(root).transition().each(() => { ++a })
  expect(a).toBe(1)
  a = 0
  selectAll([null, root]).transition().each(() => { ++a })
  expect(a).toBe(1)
})
