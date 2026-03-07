import { describe, expect, it } from 'bun:test'
import { InternMap, InternSet } from '../src/index.ts'

describe('InternMap', () => {
  it('interns keys using valueOf', () => {
    const map = new InternMap<Date, string>()
    const a = new Date(2000, 0, 1)
    const b = new Date(2000, 0, 1)
    map.set(a, 'hello')
    expect(map.get(b)).toBe('hello')
    expect(map.has(b)).toBe(true)
    expect(map.size).toBe(1)
  })

  it('supports custom key function', () => {
    const map = new InternMap<{ id: number, name: string }, string>(
      null,
      (d: unknown) => (d as { id: number }).id,
    )
    map.set({ id: 1, name: 'a' }, 'hello')
    expect(map.get({ id: 1, name: 'b' } as any)).toBe('hello')
  })

  it('supports initialization with entries', () => {
    const a = new Date(2000, 0, 1)
    const b = new Date(2001, 0, 1)
    const map = new InternMap<Date, number>([
      [a, 1],
      [b, 2],
    ])
    expect(map.size).toBe(2)
    expect(map.get(new Date(2000, 0, 1))).toBe(1)
    expect(map.get(new Date(2001, 0, 1))).toBe(2)
  })

  it('supports delete', () => {
    const map = new InternMap<Date, number>()
    const a = new Date(2000, 0, 1)
    map.set(a, 1)
    expect(map.delete(new Date(2000, 0, 1))).toBe(true)
    expect(map.size).toBe(0)
  })
})

describe('InternSet', () => {
  it('interns values using valueOf', () => {
    const set = new InternSet<Date>()
    const a = new Date(2000, 0, 1)
    const b = new Date(2000, 0, 1)
    set.add(a)
    expect(set.has(b)).toBe(true)
    expect(set.size).toBe(1)
  })

  it('supports delete', () => {
    const set = new InternSet<Date>()
    const a = new Date(2000, 0, 1)
    set.add(a)
    expect(set.delete(new Date(2000, 0, 1))).toBe(true)
    expect(set.size).toBe(0)
  })
})
