import { ascending, bisect, quantileSorted as threshold } from '@ts-charts/array'
import { initRange } from './init.ts'

export default function quantile(): any {
  let domain: number[] = []
  let range: any[] = []
  let thresholds: number[] = []
  let unknown: any

  function rescale(): any {
    let i = 0
    const n = Math.max(1, range.length)
    thresholds = new Array(n - 1)
    while (++i < n) thresholds[i - 1] = threshold(domain, i / n) as number
    return scale
  }

  function scale(x: any): any {
    return x == null || isNaN(x = +x) ? unknown : range[bisect(thresholds, x)]
  }

  scale.invertExtent = function (y: any): [number, number] {
    const i = range.indexOf(y)
    return i < 0 ? [NaN, NaN] : [
      i > 0 ? thresholds[i - 1] : domain[0],
      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
    ]
  }

  scale.domain = function (_?: any): any {
    if (!arguments.length) return domain.slice()
    domain = []
    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d)
    domain.sort(ascending)
    return rescale()
  }

  scale.range = function (_?: any): any {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice()
  }

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : unknown
  }

  scale.quantiles = function (): number[] {
    return thresholds.slice()
  }

  scale.copy = function (): any {
    return quantile()
      .domain(domain)
      .range(range)
      .unknown(unknown)
  }

  return initRange.apply(scale, arguments as any)
}
