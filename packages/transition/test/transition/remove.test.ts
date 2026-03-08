import { describe, it, expect } from 'bun:test'
import { select } from '@ts-charts/selection'
import { timeout } from '@ts-charts/timer'
import '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.remove() creates an end listener to remove the element', async () => {
  const root = document.documentElement
  const body = document.body
  const s = select(body)
  const t = s.transition().remove().on('start', started).on('end', ended)
  const end = t.end()

  function started(): void {
    expect(body.parentNode).toBe(root)
  }

  function ended(): void {
    expect(body.parentNode).toBe(null)
  }

  await new Promise<void>(resolve => timeout(() => resolve()))
  expect(body.parentNode).toBe(root)
  await end
})

jsdomit('transition.remove() creates an end listener named end.remove', async () => {
  const root = document.documentElement
  const body = document.body
  const s = select(body)
  const t = s.transition().remove().on('start', started).on('end', ended)
  const end = t.end()

  function started(): void {
    expect(body.parentNode).toBe(root)
  }

  function ended(): void {
    expect(body.parentNode).toBe(root)
  }

  const endRemove = t.on('end.remove')!
  endRemove.call(body)
  expect(body.parentNode).toBe(null)
  t.on('end.remove', null)
  root.appendChild(body)
  await end
})
