import { describe, it, expect } from 'bun:test'
import { select, selectAll } from '../../src/index.ts'

describe('selection.empty', () => {
  it('selection.empty() returns false if the selection is not empty', () => {
    expect(select(document).empty()).toBe(false)
  })

  it('selection.empty() returns true if the selection is empty', () => {
    expect(select(null).empty()).toBe(true)
    expect(selectAll([]).empty()).toBe(true)
    expect(selectAll([,]).empty()).toBe(true)
  })
})
