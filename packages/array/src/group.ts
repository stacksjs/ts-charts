import { InternMap } from '@ts-charts/internmap'
import identity from './identity.ts'

export default function group(values: Iterable<any>, ...keys: Array<(value: any, index: number, values: Iterable<any>) => any>): InternMap {
  return nest(values, identity, identity, keys)
}

export function groups(values: Iterable<any>, ...keys: Array<(value: any, index: number, values: Iterable<any>) => any>): any[] {
  return nest(values, Array.from, identity, keys)
}

function flatten(groups: unknown[][], keys: unknown[]): unknown[][] {
  for (let i = 1, n = keys.length; i < n; ++i) {
    groups = groups.flatMap((g: unknown[]) => (g.pop() as [unknown, unknown][]).map(([key, value]: [unknown, unknown]) => [...g, key, value]))
  }
  return groups
}

export function flatGroup(values: Iterable<any>, ...keys: Array<(value: any, index: number, values: Iterable<any>) => any>): any[] {
  return flatten(groups(values, ...keys), keys)
}

export function flatRollup(values: Iterable<any>, reduce: (values: any[]) => any, ...keys: Array<(value: any, index: number, values: Iterable<any>) => any>): any[] {
  return flatten(rollups(values, reduce, ...keys), keys)
}

export function rollup(values: Iterable<any>, reduce: (values: any[]) => any, ...keys: Array<(value: any, index: number, values: Iterable<any>) => any>): InternMap {
  return nest(values, identity, reduce, keys)
}

export function rollups(values: Iterable<any>, reduce: (values: any[]) => any, ...keys: Array<(value: any, index: number, values: Iterable<any>) => any>): any[] {
  return nest(values, Array.from, reduce, keys)
}

export function index(values: Iterable<any>, ...keys: Array<(value: any, index: number, values: Iterable<any>) => any>): InternMap {
  return nest(values, identity, unique, keys)
}

export function indexes(values: Iterable<any>, ...keys: Array<(value: any, index: number, values: Iterable<any>) => any>): any[] {
  return nest(values, Array.from, unique, keys)
}

function unique(values: unknown[]): unknown {
  if (values.length !== 1) throw new Error('duplicate key')
  return values[0]
}

function nest(values: Iterable<any>, map: (v: any) => any, reduce: (v: any) => any, keys: Array<(value: any, index: number, values: Iterable<any>) => any>): any {
  return (function regroup(values: Iterable<any>, i: number): any {
    if (i >= keys.length) return reduce(values as any)
    const groups = new InternMap()
    const keyof = keys[i++]
    let index = -1
    for (const value of values) {
      const key = keyof(value, ++index, values)
      const group = groups.get(key)
      if (group) (group as any[]).push(value)
      else groups.set(key, [value])
    }
    for (const [key, values] of groups) {
      groups.set(key, regroup(values as any, i))
    }
    return map(groups)
  })(values, 0)
}
