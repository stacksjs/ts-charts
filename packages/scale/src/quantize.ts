import { bisect } from '@ts-charts/array'
import { type ContinuousScale } from './continuous.ts'
import { linearish } from './linear.ts'
import { initRange } from './init.ts'

export default function quantize(): ContinuousScale {
  let x0 = 0
  let x1 = 1
  let n = 1
  let domain = [0.5]
  let range: number[] = [0, 1]
  let unknown: unknown

  function scale(x: number): number {
    return x != null && x <= x ? range[bisect(domain, x, 0, n)] : unknown as number
  }

  function rescale(): ContinuousScale {
    let i = -1
    domain = new Array(n)
    while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1)
    return scale as unknown as ContinuousScale
  }

  scale.domain = function (_?: Iterable<number>): [number, number] | ContinuousScale {
    return arguments.length ? ([x0, x1] = Array.from(_!) as [number, number], x0 = +x0, x1 = +x1, rescale()) : [x0, x1]
  }

  scale.range = function (_?: Iterable<number>): number[] | ContinuousScale {
    return arguments.length ? (n = (range = Array.from(_!)).length - 1, rescale()) : range.slice()
  }

  scale.invertExtent = function (y: unknown): [number, number] {
    const i = range.indexOf(y as number)
    return i < 0 ? [NaN, NaN]
      : i < 1 ? [x0, domain[0]]
      : i >= n ? [domain[n - 1], x1]
      : [domain[i - 1], domain[i]]
  }

  scale.unknown = function (_?: unknown): unknown | ContinuousScale {
    return arguments.length ? (unknown = _, scale as unknown as ContinuousScale) : scale as unknown as ContinuousScale
  }

  scale.thresholds = function (): number[] {
    return domain.slice()
  }

  scale.copy = function (): ContinuousScale {
    return quantize()
      .domain([x0, x1])
      .range(range)
      .unknown(unknown) as ContinuousScale
  }

  return initRange.apply(linearish(scale as unknown as ContinuousScale), arguments as unknown as []) as unknown as ContinuousScale
}
