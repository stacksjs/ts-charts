import { describe, expect, it } from 'bun:test'
import { timeMillisecond, utcMillisecond } from '../src/index.ts'

describe('utcMillisecond', () => {
  it('utcMillisecond is an alias for timeMillisecond', () => {
    expect(utcMillisecond).toBe(timeMillisecond)
  })
})
