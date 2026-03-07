import { bisect } from '@ts-charts/array'
import { linearish } from './linear.ts'
import { initRange } from './init.ts'

export default function quantize(): any {
  let x0 = 0
  let x1 = 1
  let n = 1
  let domain = [0.5]
  let range = [0, 1]
  let unknown: any

  function scale(x: any): any {
    return x != null && x <= x ? range[bisect(domain, x, 0, n)] : unknown
  }

  function rescale(): any {
    let i = -1
    domain = new Array(n)
    while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1)
    return scale
  }

  scale.domain = function (_?: any): any {
    return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1]
  }

  scale.range = function (_?: any): any {
    return arguments.length ? (n = (range = Array.from(_)).length - 1, rescale()) : range.slice()
  }

  scale.invertExtent = function (y: any): [number, number] {
    const i = range.indexOf(y)
    return i < 0 ? [NaN, NaN]
      : i < 1 ? [x0, domain[0]]
      : i >= n ? [domain[n - 1], x1]
      : [domain[i - 1], domain[i]]
  }

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : scale
  }

  scale.thresholds = function (): number[] {
    return domain.slice()
  }

  scale.copy = function (): any {
    return quantize()
      .domain([x0, x1])
      .range(range)
      .unknown(unknown)
  }

  return initRange.apply(linearish(scale), arguments as any)
}
