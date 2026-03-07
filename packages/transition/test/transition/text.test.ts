import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '@ts-charts/selection'
import '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition.text(value) creates a tween to set the text content to the specified value post-start', async () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition().text('hello')

  await new Promise<void>(resolve => t.on('start', () => {
    expect(root.textContent).toBe('')
    resolve()
  }))

  expect(root.textContent).toBe('hello')
})

jsdomit('transition.text(value) creates a tween to set the text content to the value returned by the specified function post-start', async () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition().text(() => 'hello')

  await new Promise<void>(resolve => t.on('start', () => {
    expect(root.textContent).toBe('')
    resolve()
  }))

  expect(root.textContent).toBe('hello')
})

jsdomit('transition.text(value) immediately evaluates the specified function with the expected context and arguments', '<h1 id="one"></h1><h1 id="two"></h1>', async () => {
  const one = document.querySelector('#one')!
  const two = document.querySelector('#two')!
  const s = selectAll([one, two]).data(['red', 'green'])
  const result: any[] = []
  const t = s.transition().text(function (this: any, d: any, i: number, nodes: any[]) { result.push([d, i, nodes, this]); return d })

  expect(result).toEqual([
    ['red', 0, [one, two], one],
    ['green', 1, [one, two], two],
  ])

  await new Promise<void>(resolve => t.on('start', resolve))
  expect(one.textContent).toBe('red')
  expect(two.textContent).toBe('green')
})

jsdomit('transition.text(value) creates a tween with the name "text"', () => {
  const root = document.documentElement
  const s = select(root)
  const t = s.transition().text('hello')
  expect(t.tween('text').call(root)).toBe(undefined)
  expect(root.textContent).toBe('hello')
})
