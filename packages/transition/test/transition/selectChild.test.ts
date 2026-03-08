import { describe, it, expect } from 'bun:test'
import { selectAll } from '@ts-charts/selection'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.selectChild(selector) selects the child matching the specified selector, then derives a transition', '<h1 id="one"><child></child></h1><h1 id="two"><child></child></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = selectAll([one, two]).data([1, 2]).transition().delay(function (this: any, d: any) { return d * 10 })
  const t2 = t1.selectChild('child')
  expect(t2 instanceof transition).toBe(true)
  expect(t2._groups).toEqual([[one.firstChild as Element, two.firstChild as Element]])
  expect(t2._parents).toBe(t1._parents)
  expect(t2._name).toBe(t1._name)
  expect(t2._id).toBe(t1._id)
  expect((one.firstChild as any).__data__).toBe(1)
  expect((two.firstChild as any).__data__).toBe(2)
  expect((one.firstChild as any).__transition[t1._id].delay).toBe(10)
  expect((two.firstChild as any).__transition[t1._id].delay).toBe(20)
})
