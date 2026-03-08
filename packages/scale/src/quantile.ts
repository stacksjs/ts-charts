import { ascending, bisect, quantileSorted as threshold } from '@ts-charts/array'
import { initRange } from './init.ts'

export interface QuantileScale {
  (x: number): unknown
  invertExtent(y: unknown): [number, number]
  domain(): number[]
  domain(_: Iterable<unknown>): QuantileScale
  range(): unknown[]
  range(_: Iterable<unknown>): QuantileScale
  unknown(): unknown
  unknown(_: unknown): QuantileScale
  quantiles(): number[]
  copy(): QuantileScale
  [key: string]: unknown
}

export default function quantile(): QuantileScale {
  let domain: number[] = []
  let range: unknown[] = []
  let thresholds: number[] = []
  let unknown: unknown

  function rescale(): QuantileScale {
    let i = 0
    const n = Math.max(1, range.length)
    thresholds = new Array(n - 1)
    while (++i < n) thresholds[i - 1] = threshold(domain, i / n) as number
    return scale as unknown as QuantileScale
  }

  function scale(x: number): unknown {
    return x == null || isNaN(x = +x) ? unknown : range[bisect(thresholds, x)]
  }

  scale.invertExtent = function (y: unknown): [number, number] {
    const i = range.indexOf(y)
    return i < 0 ? [NaN, NaN] : [
      i > 0 ? thresholds[i - 1] : domain[0],
      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
    ]
  }

  scale.domain = function (_?: Iterable<unknown>): number[] | QuantileScale {
    if (!arguments.length) return domain.slice()
    domain = []
    for (let d of _! as Iterable<number>) if (d != null && !isNaN(d = +d)) domain.push(d)
    domain.sort(ascending)
    return rescale()
  }

  scale.range = function (_?: Iterable<unknown>): unknown[] | QuantileScale {
    return arguments.length ? (range = Array.from(_!), rescale()) : range.slice()
  }

  scale.unknown = function (_?: unknown): unknown | QuantileScale {
    return arguments.length ? (unknown = _, scale as unknown as QuantileScale) : unknown
  }

  scale.quantiles = function (): number[] {
    return thresholds.slice()
  }

  scale.copy = function (): QuantileScale {
    return quantile()
      .domain(domain)
      .range(range)
      .unknown(unknown) as QuantileScale
  }

  return initRange.apply(scale as unknown as Record<string, unknown>, arguments as unknown as []) as unknown as QuantileScale
}
