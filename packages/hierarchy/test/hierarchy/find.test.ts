import { describe, expect, it } from 'bun:test'
import { hierarchy } from '../../src/index.ts'

describe('node.find', () => {
  it('node.find() finds nodes', () => {
    const root = hierarchy({ id: 'root', children: [{ id: 'a' }, { id: 'b', children: [{ id: 'ba' }] }] } as any).count()
    expect(root.find((d: any) => d.data.id === 'b')!.data.id).toBe('b')
    expect(root.find((_d: any, i: number) => i === 0)!.data.id).toBe('root')
    expect(root.find((d: any, _i: number, e: any) => d !== e)!.data.id).toBe('a')
  })
})
