import { describe, expect, it } from 'bun:test'
import { hierarchy } from '../../src/index.ts'

describe('node.links', () => {
  it('node.links() returns an array of {source, target}', () => {
    const root = hierarchy({ id: 'root', children: [{ id: 'a' }, { id: 'b', children: [{ id: 'ba' }] }] } as any)
    const a = root.children![0]
    const b = root.children![1]
    const ba = root.children![1].children![0]
    expect(root.links()).toEqual([
      { source: root, target: a },
      { source: root, target: b },
      { source: b, target: ba },
    ])
  })
})
