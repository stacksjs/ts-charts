import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '@ts-charts/selection'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.merge(other) merges elements from the specified other transition for null elements in this transition', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t0 = select(document.documentElement).transition()
  const t1 = selectAll([null, two]).transition(t0)
  const t2 = selectAll([one, null]).transition(t0)
  const t3 = t1.merge(t2)
  expect(t3 instanceof transition).toBe(true)
  expect(t3._groups).toEqual([[one, two]])
  expect(t3._parents).toBe(t1._parents)
  expect(t3._name).toBe(t1._name)
  expect(t3._id).toBe(t1._id)
})

jsdomit('transition.merge(other) throws an error if the other transition has a different id', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = selectAll([null, two]).transition()
  const t2 = selectAll([one, null]).transition()
  expect(() => { t1.merge(t2) }).toThrow()
})
