import { describe, it, expect } from 'bun:test'
import { transition } from '../../src/index.ts'

it('transition.nodes is defined', () => {
  expect(typeof transition.prototype.nodes).toBe('function')
})
