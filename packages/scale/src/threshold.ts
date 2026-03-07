import { bisect } from '@ts-charts/array'
import { initRange } from './init.ts'

export default function threshold(): any {
  let domain: any[] = [0.5]
  let range: any[] = [0, 1]
  let unknown: any
  let n = 1

  function scale(x: any): any {
    return x != null && x <= x ? range[bisect(domain, x, 0, n)] : unknown
  }

  scale.domain = function (_?: any): any {
    return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : domain.slice()
  }

  scale.range = function (_?: any): any {
    return arguments.length ? (range = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : range.slice()
  }

  scale.invertExtent = function (y: any): [any, any] {
    const i = range.indexOf(y)
    return [domain[i - 1], domain[i]]
  }

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : unknown
  }

  scale.copy = function (): any {
    return threshold()
      .domain(domain)
      .range(range)
      .unknown(unknown)
  }

  return initRange.apply(scale, arguments as any)
}
