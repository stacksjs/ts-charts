import { describe, it, expect } from 'bun:test'
import { select, selection, Selection } from '../../src/index.ts'

describe('selection()', () => {
  it('selection() returns a selection of the document element', () => {
    expect(selection().node()).toBe(document.documentElement)
  })

  it('selection() returns an instanceof Selection', () => {
    expect(selection() instanceof Selection).toBe(true)
  })
})
