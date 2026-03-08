import { InternMap } from '@ts-charts/array'
import { initRange } from './init.ts'

export const implicit: unique symbol = Symbol('implicit') as unknown as typeof implicit

export interface OrdinalScale {
  (d: unknown): unknown
  domain(): unknown[]
  domain(_: Iterable<unknown>): OrdinalScale
  range(): unknown[]
  range(_: Iterable<unknown>): OrdinalScale
  unknown(): unknown
  unknown(_: unknown): OrdinalScale
  copy(): OrdinalScale
  [key: string]: unknown
}

export default function ordinal(): OrdinalScale {
  let index = new InternMap()
  let domain: unknown[] = []
  let range: unknown[] = []
  let unknown: unknown = implicit

  function scale(d: unknown): unknown {
    let i = index.get(d) as number | undefined
    if (i === undefined) {
      if (unknown !== implicit) return unknown
      index.set(d, i = domain.push(d) - 1)
    }
    return range[i % range.length]
  }

  scale.domain = function (_?: Iterable<unknown>): unknown[] | OrdinalScale {
    if (!arguments.length) return domain.slice()
    domain = [], index = new InternMap()
    for (const value of _!) {
      if (index.has(value)) continue
      index.set(value, domain.push(value) - 1)
    }
    return scale as unknown as OrdinalScale
  }

  scale.range = function (_?: Iterable<unknown>): unknown[] | OrdinalScale {
    return arguments.length ? (range = Array.from(_!), scale as unknown as OrdinalScale) : range.slice()
  }

  scale.unknown = function (_?: unknown): unknown | OrdinalScale {
    return arguments.length ? (unknown = _, scale as unknown as OrdinalScale) : unknown
  }

  scale.copy = function (): OrdinalScale {
    return ordinal().domain(domain).range(range).unknown(unknown) as OrdinalScale
  }

  initRange.apply(scale as unknown as Record<string, unknown>, arguments as unknown as [])

  return scale as unknown as OrdinalScale
}
