import { InternMap } from '@ts-charts/array'
import { initRange } from './init.ts'

export const implicit: unique symbol = Symbol('implicit') as any

export default function ordinal(): any {
  let index = new InternMap()
  let domain: any[] = []
  let range: any[] = []
  let unknown: any = implicit

  function scale(d: any): any {
    let i = index.get(d)
    if (i === undefined) {
      if (unknown !== implicit) return unknown
      index.set(d, i = domain.push(d) - 1)
    }
    return range[i % range.length]
  }

  scale.domain = function (_?: any): any {
    if (!arguments.length) return domain.slice()
    domain = [], index = new InternMap()
    for (const value of _) {
      if (index.has(value)) continue
      index.set(value, domain.push(value) - 1)
    }
    return scale
  }

  scale.range = function (_?: any): any {
    return arguments.length ? (range = Array.from(_), scale) : range.slice()
  }

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : unknown
  }

  scale.copy = function (): any {
    return ordinal(domain, range).unknown(unknown)
  }

  initRange.apply(scale, arguments as any)

  return scale
}
