import { ascending, bisect, quantile } from '@ts-charts/array'
import { identity } from './continuous.ts'
import { initInterpolator } from './init.ts'

type InterpolatorFn = (t: number) => number

export interface SequentialQuantileScale {
  (x: number): number | undefined
  domain(): number[]
  domain(_: Iterable<unknown>): SequentialQuantileScale
  interpolator(): InterpolatorFn
  interpolator(_: InterpolatorFn): SequentialQuantileScale
  range(): number[]
  quantiles(n: number): (number | undefined)[]
  copy(): SequentialQuantileScale
  [key: string]: unknown
}

export default function sequentialQuantile(): SequentialQuantileScale {
  let domain: number[] = []
  let interpolator: InterpolatorFn = identity as InterpolatorFn

  function scale(x: number): number | undefined {
    if (x != null && !isNaN(x = +x)) return interpolator((bisect(domain, x, 1) - 1) / (domain.length - 1))
  }

  scale.domain = function (_?: Iterable<unknown>): number[] | SequentialQuantileScale {
    if (!arguments.length) return domain.slice()
    domain = []
    for (let d of _! as Iterable<number>) if (d != null && !isNaN(d = +d)) domain.push(d)
    domain.sort(ascending)
    return scale as unknown as SequentialQuantileScale
  }

  scale.interpolator = function (_?: InterpolatorFn): InterpolatorFn | SequentialQuantileScale {
    return arguments.length ? (interpolator = _!, scale as unknown as SequentialQuantileScale) : interpolator
  }

  scale.range = function (): number[] {
    return domain.map((d: number, i: number): number => interpolator(i / (domain.length - 1)))
  }

  scale.quantiles = function (n: number): (number | undefined)[] {
    return Array.from({ length: n + 1 }, (_: unknown, i: number): number | undefined => quantile(domain, i / n))
  }

  scale.copy = function (): SequentialQuantileScale {
    return sequentialQuantile().interpolator(interpolator).domain(domain) as SequentialQuantileScale
  }

  return initInterpolator.apply(scale as unknown as Record<string, unknown>, arguments as unknown as []) as unknown as SequentialQuantileScale
}
