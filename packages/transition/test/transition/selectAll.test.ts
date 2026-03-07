import { describe, it, expect } from 'bun:test'
import { selectAll } from '@ts-charts/selection'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.selectAll(selector) selects the descendants matching the specified selector, then derives a transition', '<h1 id="one"><child></child></h1><h1 id="two"><child></child></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = selectAll([one, two]).data([1, 2]).transition().delay(function (this: any, d: any) { return d * 10 })
  const t2 = t1.selectAll('child')
  expect(t2 instanceof transition).toBe(true)
  expect(t2._groups.map((group: any) => Array.from(group))).toEqual([[one.firstChild], [two.firstChild]])
  expect(t2._parents).toEqual([one, two])
  expect(t2._name).toBe(t1._name)
  expect(t2._id).toBe(t1._id)
  expect('__data__' in (one.firstChild as any)).toBe(false)
  expect('__data__' in (two.firstChild as any)).toBe(false)
  expect((one.firstChild as any).__transition[t1._id].delay).toBe(10)
  expect((two.firstChild as any).__transition[t1._id].delay).toBe(20)
})

jsdomit('transition.selectAll(function) selects the descendants returned by the specified function, then derives a transition', '<h1 id="one"><child></child></h1><h1 id="two"><child></child></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = selectAll([one, two]).data([1, 2]).transition().delay(function (this: any, d: any) { return d * 10 })
  const t2 = t1.selectAll(function (this: any) { return [this.firstChild] })
  expect(t2 instanceof transition).toBe(true)
  expect(t2._groups).toEqual([[one.firstChild], [two.firstChild]])
  expect(t2._parents).toEqual([one, two])
  expect(t2._name).toBe(t1._name)
  expect(t2._id).toBe(t1._id)
  expect('__data__' in (one.firstChild as any)).toBe(false)
  expect('__data__' in (two.firstChild as any)).toBe(false)
  expect((one.firstChild as any).__transition[t1._id].delay).toBe(10)
  expect((two.firstChild as any).__transition[t1._id].delay).toBe(20)
})
