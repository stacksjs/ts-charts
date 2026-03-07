import { describe, it, expect } from 'bun:test'
import { transition } from '../../src/index.ts'

it('transition.node is defined', () => {
  expect(typeof transition.prototype.node).toBe('function')
})
