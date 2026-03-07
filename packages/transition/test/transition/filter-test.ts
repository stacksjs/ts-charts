import { describe, it, expect } from 'bun:test'
import { selectAll } from '@ts-charts/selection'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.filter(selector) retains the elements matching the specified selector', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = selectAll([one, two]).data([1, 2]).transition().delay(function (this: any, d: any) { return d * 10 })
  const t2 = t1.filter('#two')
  expect(t2 instanceof transition).toBe(true)
  expect(t2._groups).toEqual([[two]])
  expect(t2._parents).toBe(t1._parents)
  expect(t2._name).toBe(t1._name)
  expect(t2._id).toBe(t1._id)
})

jsdomit('transition.filter(function) retains the elements for which the specified function returns true', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = selectAll([one, two]).data([1, 2]).transition().delay(function (this: any, d: any) { return d * 10 })
  const t2 = t1.filter(function (this: any) { return this === two })
  expect(t2 instanceof transition).toBe(true)
  expect(t2._groups).toEqual([[two]])
  expect(t2._parents).toBe(t1._parents)
  expect(t2._name).toBe(t1._name)
  expect(t2._id).toBe(t1._id)
})
