import { describe, it, expect } from 'bun:test'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

jsdomit('transition() returns a transition on the document element with the null name', () => {
  const root = document.documentElement
  const t = transition()
  const schedule = (root as any).__transition[t._id]
  expect(t.node()).toBe(root)
  expect(schedule.name).toBe(null)
})

jsdomit('transition(null) returns a transition on the document element with the null name', () => {
  const root = document.documentElement
  const t = transition(null as any)
  const schedule = (root as any).__transition[t._id]
  expect(t.node()).toBe(root)
  expect(schedule.name).toBe(null)
})

jsdomit('transition(undefined) returns a transition on the document element with the null name', () => {
  const root = document.documentElement
  const t = transition(undefined)
  const schedule = (root as any).__transition[t._id]
  expect(t.node()).toBe(root)
  expect(schedule.name).toBe(null)
})

jsdomit('transition(name) returns a transition on the document element with the specified name', () => {
  const root = document.documentElement
  const t = transition('foo')
  const schedule = (root as any).__transition[t._id]
  expect(t.node()).toBe(root)
  expect(schedule.name).toBe('foo')
})

jsdomit('transition.prototype can be extended', () => {
  try {
    let pass = 0;
    (transition as any).prototype.test = () => { return ++pass }
    expect((transition() as any).test()).toBe(1)
    expect(pass).toBe(1)
  }
  finally {
    delete (transition as any).prototype.test
  }
})

jsdomit('transitions are instanceof transition', () => {
  expect(transition() instanceof transition).toBe(true)
})
