import { describe, expect, it } from 'bun:test'
import { hierarchy } from '../../src/index.ts'

describe('hierarchy', () => {
  it('d3.hierarchy(data, children) supports iterable children', () => {
    const root = hierarchy({ id: 'root', children: new Set([{ id: 'a' }, { id: 'b', children: new Set([{ id: 'ba' }]) }]) } as any)
    const a = root.children![0]
    const b = root.children![1]
    const ba = root.children![1].children![0]
    expect(root.links()).toEqual([
      { source: root, target: a },
      { source: root, target: b },
      { source: b, target: ba },
    ])
  })

  it('d3.hierarchy(data, children) ignores non-iterable children', () => {
    const root = hierarchy({ id: 'root', children: [{ id: 'a', children: null }, { id: 'b', children: 42 }] } as any)
    const a = root.children![0]
    const b = root.children![1]
    expect(root.links()).toEqual([
      { source: root, target: a },
      { source: root, target: b },
    ])
  })
})
