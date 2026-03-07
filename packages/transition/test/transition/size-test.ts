import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '@ts-charts/selection'
import { transition } from '../../src/index.ts'
import jsdomit from '../jsdom.ts'

it('transition.size is defined', () => {
  expect(typeof transition.prototype.size).toBe('function')
})

jsdomit('transition.size() returns the expected value', () => {
  const root = document.documentElement
  expect(select(root).transition().size()).toBe(1)
  expect(selectAll([null, root]).transition().size()).toBe(1)
})
