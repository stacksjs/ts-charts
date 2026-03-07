import { describe, expect, it } from 'bun:test'
import { hierarchy } from '../../src/index.ts'

const tree = { id: 'root', children: [{ id: 'a', children: [{ id: 'ab' }] }, { id: 'b', children: [{ id: 'ba' }] }] }

describe('hierarchy traversals', () => {
  it('node.each() traverses a hierarchy in breadth-first order', () => {
    const root = hierarchy(tree)
    const a: string[] = []
    root.each((d: any) => void a.push(d.data.id))
    expect(a).toEqual(['root', 'a', 'b', 'ab', 'ba'])
  })

  it('node.eachBefore() traverses a hierarchy in pre-order traversal', () => {
    const root = hierarchy(tree)
    const a: string[] = []
    root.eachBefore((d: any) => void a.push(d.data.id))
    expect(a).toEqual(['root', 'a', 'ab', 'b', 'ba'])
  })

  it('node.eachAfter() traverses a hierarchy in post-order traversal', () => {
    const root = hierarchy(tree)
    const a: string[] = []
    root.eachAfter((d: any) => void a.push(d.data.id))
    expect(a).toEqual(['ab', 'a', 'ba', 'b', 'root'])
  })

  it('a hierarchy is an iterable equivalent to *node*.each()', () => {
    const root = hierarchy(tree)
    const a = Array.from(root, (d: any) => d.data.id)
    expect(a).toEqual(['root', 'a', 'b', 'ab', 'ba'])
  })
})
