import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '@ts-charts/selection'
import jsdomit from '../jsdom.ts'
import '../../src/index.ts'

jsdomit('transition.delay() returns the delay for the first non-null node', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t1 = select(one).transition()
  const t2 = select(two).transition().delay(50)
  expect((one as any).__transition[t1._id].delay).toBe(0)
  expect((two as any).__transition[t2._id].delay).toBe(50)
  expect(t1.delay()).toBe(0)
  expect(t2.delay()).toBe(50)
  expect(select(one).transition(t1).delay()).toBe(0)
  expect(select(two).transition(t2).delay()).toBe(50)
  expect(selectAll([null, one]).transition(t1).delay()).toBe(0)
  expect(selectAll([null, two]).transition(t2).delay()).toBe(50)
})

jsdomit('transition.delay(number) sets the delay for each selected element to the specified number', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t = selectAll([one, two]).transition().delay(50)
  expect((one as any).__transition[t._id].delay).toBe(50)
  expect((two as any).__transition[t._id].delay).toBe(50)
})

jsdomit('transition.delay(value) coerces the specified value to a number', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t = selectAll([one, two]).transition().delay('50' as any)
  expect((one as any).__transition[t._id].delay).toBe(50)
  expect((two as any).__transition[t._id].delay).toBe(50)
})

jsdomit('transition.delay(function) passes the expected arguments and context to the function', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const result: any[] = []
  const s = selectAll([one, two]).data(['one', 'two'])
  const t = s.transition().delay(function (this: any, d: any, i: number, nodes: any[]) { result.push([d, i, nodes, this]) })
  expect(result).toEqual([
    ['one', 0, t._groups[0], one],
    ['two', 1, t._groups[0], two],
  ])
})

jsdomit('transition.delay(function) sets the delay for each selected element to the number returned by the specified function', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t = selectAll([one, two]).transition().delay(function (this: any, d: any, i: number) { return i * 20 })
  expect((one as any).__transition[t._id].delay).toBe(0)
  expect((two as any).__transition[t._id].delay).toBe(20)
})

jsdomit('transition.delay(function) coerces the value returned by the specified function to a number', '<h1 id="one"></h1><h1 id="two"></h1>', () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const t = selectAll([one, two]).transition().delay(function (this: any, d: any, i: number) { return i * 20 + '' } as any)
  expect((one as any).__transition[t._id].delay).toBe(0)
  expect((two as any).__transition[t._id].delay).toBe(20)
})
