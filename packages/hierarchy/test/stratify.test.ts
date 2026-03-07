import { describe, expect, it } from 'bun:test'
import { hierarchy, stratify, HierarchyNode } from '../src/index.ts'

function noparent(node: any): any {
  const copy: any = {}
  for (const k in node) {
    if (Object.prototype.hasOwnProperty.call(node, k)) {
      switch (k) {
        case 'children': copy.children = node.children.map(noparent); break
        case 'parent': break
        default: copy[k] = node[k]; break
      }
    }
  }
  return copy
}

describe('stratify', () => {
  it('stratify() has the expected defaults', () => {
    const s = stratify()
    expect(s.id()!({ id: 'foo' } as any, 0, [])).toBe('foo')
    expect(s.parentId()!({ parentId: 'bar' } as any, 0, [])).toBe('bar')
  })

  it('stratify(data) returns the root node', () => {
    const s = stratify()
    const root = s([
      { id: 'a' },
      { id: 'aa', parentId: 'a' },
      { id: 'ab', parentId: 'a' },
      { id: 'aaa', parentId: 'aa' },
    ] as any[])
    expect(root instanceof HierarchyNode).toBe(true)
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 2,
      data: { id: 'a' },
      children: [
        {
          id: 'aa',
          depth: 1,
          height: 1,
          data: { id: 'aa', parentId: 'a' },
          children: [
            {
              id: 'aaa',
              depth: 2,
              height: 0,
              data: { id: 'aaa', parentId: 'aa' },
            },
          ],
        },
        {
          id: 'ab',
          depth: 1,
          height: 0,
          data: { id: 'ab', parentId: 'a' },
        },
      ],
    })
  })

  it('stratify(data) does not require the data to be in topological order', () => {
    const s = stratify()
    const root = s([
      { id: 'aaa', parentId: 'aa' },
      { id: 'aa', parentId: 'a' },
      { id: 'ab', parentId: 'a' },
      { id: 'a' },
    ] as any[])
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 2,
      data: { id: 'a' },
      children: [
        {
          id: 'aa',
          depth: 1,
          height: 1,
          data: { id: 'aa', parentId: 'a' },
          children: [
            {
              id: 'aaa',
              depth: 2,
              height: 0,
              data: { id: 'aaa', parentId: 'aa' },
            },
          ],
        },
        {
          id: 'ab',
          depth: 1,
          height: 0,
          data: { id: 'ab', parentId: 'a' },
        },
      ],
    })
  })

  it('stratify(data) preserves the input order of siblings', () => {
    const s = stratify()
    const root = s([
      { id: 'aaa', parentId: 'aa' },
      { id: 'ab', parentId: 'a' },
      { id: 'aa', parentId: 'a' },
      { id: 'a' },
    ] as any[])
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 2,
      data: { id: 'a' },
      children: [
        {
          id: 'ab',
          depth: 1,
          height: 0,
          data: { id: 'ab', parentId: 'a' },
        },
        {
          id: 'aa',
          depth: 1,
          height: 1,
          data: { id: 'aa', parentId: 'a' },
          children: [
            {
              id: 'aaa',
              depth: 2,
              height: 0,
              data: { id: 'aaa', parentId: 'aa' },
            },
          ],
        },
      ],
    })
  })

  it('stratify(data) accepts an iterable', () => {
    const s = stratify()
    const root = s(new Set([
      { id: 'aaa', parentId: 'aa' },
      { id: 'ab', parentId: 'a' },
      { id: 'aa', parentId: 'a' },
      { id: 'a' },
    ] as any[]))
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 2,
      data: { id: 'a' },
      children: [
        {
          id: 'ab',
          depth: 1,
          height: 0,
          data: { id: 'ab', parentId: 'a' },
        },
        {
          id: 'aa',
          depth: 1,
          height: 1,
          data: { id: 'aa', parentId: 'a' },
          children: [
            {
              id: 'aaa',
              depth: 2,
              height: 0,
              data: { id: 'aaa', parentId: 'aa' },
            },
          ],
        },
      ],
    })
  })

  it('stratify(data) treats an empty parentId as the root', () => {
    const s = stratify()
    const root = s([
      { id: 'a', parentId: '' },
      { id: 'aa', parentId: 'a' },
      { id: 'ab', parentId: 'a' },
      { id: 'aaa', parentId: 'aa' },
    ] as any[])
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 2,
      data: { id: 'a', parentId: '' },
      children: [
        {
          id: 'aa',
          depth: 1,
          height: 1,
          data: { id: 'aa', parentId: 'a' },
          children: [
            {
              id: 'aaa',
              depth: 2,
              height: 0,
              data: { id: 'aaa', parentId: 'aa' },
            },
          ],
        },
        {
          id: 'ab',
          depth: 1,
          height: 0,
          data: { id: 'ab', parentId: 'a' },
        },
      ],
    })
  })

  it('stratify(data) does not treat a falsy but non-empty parentId as the root', () => {
    const s = stratify()
    const root = s([
      { id: 0, parentId: null },
      { id: 1, parentId: 0 },
      { id: 2, parentId: 0 },
    ] as any[])
    expect(noparent(root)).toEqual({
      id: '0',
      depth: 0,
      height: 1,
      data: { id: 0, parentId: null },
      children: [
        {
          id: '1',
          depth: 1,
          height: 0,
          data: { id: 1, parentId: 0 },
        },
        {
          id: '2',
          depth: 1,
          height: 0,
          data: { id: 2, parentId: 0 },
        },
      ],
    })
  })

  it('stratify(data) throws an error if the data does not have a single root', () => {
    const s = stratify()
    expect(() => { s([{ id: 'a' }, { id: 'b' }] as any[]) }).toThrow(/multiple roots/)
    expect(() => { s([{ id: 'a', parentId: 'a' }] as any[]) }).toThrow(/no root/)
    expect(() => { s([{ id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }] as any[]) }).toThrow(/no root/)
  })

  it('stratify(data) throws an error if the hierarchy is cyclical', () => {
    const s = stratify()
    expect(() => { s([{ id: 'root' }, { id: 'a', parentId: 'a' }] as any[]) }).toThrow(/cycle/)
    expect(() => { s([{ id: 'root' }, { id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }] as any[]) }).toThrow(/cycle/)
  })

  it('stratify(data) throws an error if multiple parents have the same id', () => {
    const s = stratify()
    expect(() => { s([{ id: 'a' }, { id: 'b', parentId: 'a' }, { id: 'b', parentId: 'a' }, { id: 'c', parentId: 'b' }] as any[]) }).toThrow(/ambiguous/)
  })

  it('stratify(data) throws an error if the specified parent is not found', () => {
    const s = stratify()
    expect(() => { s([{ id: 'a' }, { id: 'b', parentId: 'c' }] as any[]) }).toThrow(/missing/)
  })

  it('stratify(data) allows the id to be undefined for leaf nodes', () => {
    const s = stratify()
    const root = s([
      { id: 'a' },
      { parentId: 'a' },
      { parentId: 'a' },
    ] as any[])
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 1,
      data: { id: 'a' },
      children: [
        {
          depth: 1,
          height: 0,
          data: { parentId: 'a' },
        },
        {
          depth: 1,
          height: 0,
          data: { parentId: 'a' },
        },
      ],
    })
  })

  it('stratify(data) allows the id to be non-unique for leaf nodes', () => {
    const s = stratify()
    const root = s([
      { id: 'a', parentId: null },
      { id: 'b', parentId: 'a' },
      { id: 'b', parentId: 'a' },
    ] as any[])
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 1,
      data: { id: 'a', parentId: null },
      children: [
        {
          id: 'b',
          depth: 1,
          height: 0,
          data: { id: 'b', parentId: 'a' },
        },
        {
          id: 'b',
          depth: 1,
          height: 0,
          data: { id: 'b', parentId: 'a' },
        },
      ],
    })
  })

  it('stratify(data) coerces the id to a string, if not null and not empty', () => {
    const s = stratify()
    expect(s([{ id: { toString() { return 'a' } } }] as any[]).id).toBe('a')
    expect(s([{ id: '' }] as any[]).id).toBe(undefined)
    expect(s([{ id: null }] as any[]).id).toBe(undefined)
    expect(s([{ id: undefined }] as any[]).id).toBe(undefined)
    expect(s([{}] as any[]).id).toBe(undefined)
  })

  it('stratify.id(id) observes the specified id function', () => {
    const foo = (d: any) => d.foo
    const s = stratify().id(foo)
    const root = s([
      { foo: 'a' },
      { foo: 'aa', parentId: 'a' },
      { foo: 'ab', parentId: 'a' },
      { foo: 'aaa', parentId: 'aa' },
    ] as any[])
    expect(s.id()).toBe(foo)
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 2,
      data: { foo: 'a' },
      children: [
        {
          id: 'aa',
          depth: 1,
          height: 1,
          data: { foo: 'aa', parentId: 'a' },
          children: [
            {
              id: 'aaa',
              depth: 2,
              height: 0,
              data: { foo: 'aaa', parentId: 'aa' },
            },
          ],
        },
        {
          id: 'ab',
          depth: 1,
          height: 0,
          data: { foo: 'ab', parentId: 'a' },
        },
      ],
    })
  })

  it('stratify.id(id) tests that id is a function', () => {
    const s = stratify()
    expect(() => void s.id(42 as any)).toThrow()
    expect(() => void s.id('nope' as any)).toThrow()
  })

  it('stratify.parentId(id) observes the specified parent id function', () => {
    const foo = (d: any) => d.foo
    const s = stratify().parentId(foo)
    const root = s([
      { id: 'a' },
      { id: 'aa', foo: 'a' },
      { id: 'ab', foo: 'a' },
      { id: 'aaa', foo: 'aa' },
    ] as any[])
    expect(s.parentId()).toBe(foo)
    expect(noparent(root)).toEqual({
      id: 'a',
      depth: 0,
      height: 2,
      data: { id: 'a' },
      children: [
        {
          id: 'aa',
          depth: 1,
          height: 1,
          data: { id: 'aa', foo: 'a' },
          children: [
            {
              id: 'aaa',
              depth: 2,
              height: 0,
              data: { id: 'aaa', foo: 'aa' },
            },
          ],
        },
        {
          id: 'ab',
          depth: 1,
          height: 0,
          data: { id: 'ab', foo: 'a' },
        },
      ],
    })
  })

  it('stratify.parentId(id) tests that id is a function', () => {
    const s = stratify()
    expect(() => void s.parentId(42 as any)).toThrow()
    expect(() => void s.parentId('nope' as any)).toThrow()
  })

  it('stratify.path(path) returns the root node', () => {
    const root = stratify().path((d: any) => d.path)([
      { path: '/' },
      { path: '/aa' },
      { path: '/ab' },
      { path: '/aa/aaa' },
    ] as any[])
    expect(root instanceof HierarchyNode).toBe(true)
    expect(noparent(root)).toEqual({
      id: '/',
      depth: 0,
      height: 2,
      data: { path: '/' },
      children: [
        {
          id: '/aa',
          depth: 1,
          height: 1,
          data: { path: '/aa' },
          children: [
            {
              id: '/aa/aaa',
              depth: 2,
              height: 0,
              data: { path: '/aa/aaa' },
            },
          ],
        },
        {
          id: '/ab',
          depth: 1,
          height: 0,
          data: { path: '/ab' },
        },
      ],
    })
  })

  it('stratify.path(path) correctly handles single-character folders', () => {
    const root = stratify().path((d: any) => d.path)([
      { path: '/' },
      { path: '/d' },
      { path: '/d/123' },
    ] as any[])
    expect(root instanceof HierarchyNode).toBe(true)
    expect(noparent(root)).toEqual({
      id: '/',
      depth: 0,
      height: 2,
      data: { path: '/' },
      children: [
        {
          id: '/d',
          depth: 1,
          height: 1,
          data: { path: '/d' },
          children: [
            {
              id: '/d/123',
              depth: 2,
              height: 0,
              data: { path: '/d/123' },
            },
          ],
        },
      ],
    })
  })

  it('stratify.path(path) imputes internal nodes', () => {
    const root = stratify().path((d: any) => d.path)([
      { path: '/aa/aaa' },
      { path: '/ab' },
    ] as any[])
    expect(root instanceof HierarchyNode).toBe(true)
    expect(noparent(root)).toEqual({
      id: '/',
      depth: 0,
      height: 2,
      data: null,
      children: [
        {
          id: '/ab',
          depth: 1,
          height: 0,
          data: { path: '/ab' },
        },
        {
          id: '/aa',
          depth: 1,
          height: 1,
          data: null,
          children: [
            {
              id: '/aa/aaa',
              depth: 2,
              height: 0,
              data: { path: '/aa/aaa' },
            },
          ],
        },
      ],
    })
  })
})
