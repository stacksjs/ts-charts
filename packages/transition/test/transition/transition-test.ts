import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.transition() allows preceeding transitions with zero duration to end naturally', async () => {
  let end0 = false
  let end1 = false
  let end2 = false
  const s = select(document.documentElement)
  const t = s.transition().duration(0).on('end', () => { end0 = true })
  s.transition().duration(0).on('end', () => { end1 = true })
  t.transition().duration(0).on('end', () => { end2 = true })
  await new Promise<void>(resolve => timeout(resolve, 50))
  expect(end0).toBe(true)
  expect(end1).toBe(true)
  expect(end2).toBe(true)
})
