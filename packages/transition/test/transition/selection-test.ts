import { describe, it, expect } from 'bun:test'
import { select, Selection } from '@ts-charts/selection'
import '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.selection() returns the transition\'s selection', '<h1 id="one">one</h1><h1 id="two">two</h1>', () => {
  const s0 = select(document.body).selectAll('h1')
  const t = s0.transition()
  const s1 = t.selection()
  expect(s1 instanceof Selection).toBe(true)
  expect(s1._groups).toBe(s0._groups)
  expect(s1._parents).toBe(s0._parents)
})
