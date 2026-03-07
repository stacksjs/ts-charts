import { describe, it, expect } from 'bun:test'
import { transition } from '../../src/index.ts'

it('transition.empty is defined', () => {
  expect(typeof transition.prototype.empty).toBe('function')
})
