import { describe, it, expect } from 'bun:test'
import * as d3 from '../src/index.ts'

describe('brush', () => {
  it('brush methods', () => {
    expect(Object.keys(d3).sort()).toEqual(
      ['brush', 'brushSelection', 'brushX', 'brushY'].sort(),
    )
  })
})
