import { bisect } from '@ts-charts/array'
import { initRange } from './init.ts'

export interface ThresholdScale {
  (x: number): unknown
  domain(): unknown[]
  domain(_: Iterable<unknown>): ThresholdScale
  range(): unknown[]
  range(_: Iterable<unknown>): ThresholdScale
  invertExtent(y: unknown): [unknown, unknown]
  unknown(): unknown
  unknown(_: unknown): ThresholdScale
  copy(): ThresholdScale
  [key: string]: unknown
}

export default function threshold(): ThresholdScale {
  let domain: unknown[] = [0.5]
  let range: unknown[] = [0, 1]
  let unknown: unknown
  let n = 1

  function scale(x: number): unknown {
    return x != null && x <= x ? range[bisect(domain as number[], x, 0, n)] : unknown
  }

  scale.domain = function (_?: Iterable<unknown>): unknown[] | ThresholdScale {
    return arguments.length ? (domain = Array.from(_!), n = Math.min(domain.length, range.length - 1), scale as unknown as ThresholdScale) : domain.slice()
  }

  scale.range = function (_?: Iterable<unknown>): unknown[] | ThresholdScale {
    return arguments.length ? (range = Array.from(_!), n = Math.min(domain.length, range.length - 1), scale as unknown as ThresholdScale) : range.slice()
  }

  scale.invertExtent = function (y: unknown): [unknown, unknown] {
    const i = range.indexOf(y)
    return [domain[i - 1], domain[i]]
  }

  scale.unknown = function (_?: unknown): unknown | ThresholdScale {
    return arguments.length ? (unknown = _, scale as unknown as ThresholdScale) : unknown
  }

  scale.copy = function (): ThresholdScale {
    return threshold()
      .domain(domain)
      .range(range)
      .unknown(unknown) as ThresholdScale
  }

  return initRange.apply(scale as unknown as Record<string, unknown>, arguments as unknown as []) as unknown as ThresholdScale
}
