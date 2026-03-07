import { describe, expect, it } from 'bun:test'
import { hierarchy } from '../../src/index.ts'

describe('node.copy', () => {
  it('node.copy() copies values', () => {
    const root = hierarchy({ id: 'root', children: [{ id: 'a' }, { id: 'b', children: [{ id: 'ba' }] }] } as any).count()
    expect(root.copy().value).toBe(2)
  })
})
