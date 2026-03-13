import { ticks, tickIncrement } from '@ts-charts/array'
import continuous, { copy, type ContinuousScale } from './continuous.ts'
import { initRange } from './init.ts'
import tickFormat from './tickFormat.ts'

export function linearish<T extends ContinuousScale>(scale: T): T {
  const domain = scale.domain as (() => number[])

  scale.ticks = function (count?: number): number[] {
    const d = domain()
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count)
  }

  scale.tickFormat = function (count?: number, specifier?: string): (d: number) => string {
    const d = domain()
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier)
  }

  scale.nice = function (count?: number): ContinuousScale {
    if (count == null) count = 10

    const d = domain()
    let i0 = 0
    let i1 = d.length - 1
    let start = d[i0]
    let stop = d[i1]
    let prestep: number | undefined
    let step: number
    let maxIter = 10

    if (stop < start) {
      step = start, start = stop, stop = step
      step = i0, i0 = i1, i1 = step
    }

    while (maxIter-- > 0) {
      step = tickIncrement(start, stop, count)
      if (step === prestep) {
        d[i0] = start
        d[i1] = stop
        return (scale.domain as (d: number[]) => ContinuousScale)(d)
      // eslint-disable-next-line pickier/no-unused-vars
      }
      else if (step > 0) {
        start = Math.floor(start / step) * step
        stop = Math.ceil(stop / step) * step
      // eslint-disable-next-line pickier/no-unused-vars
      }
      else if (step < 0) {
        start = Math.ceil(start * step) / step
        stop = Math.floor(stop * step) / step
      // eslint-disable-next-line pickier/no-unused-vars
      }
      else {
        break
      }
      prestep = step
    }

    return scale
  }

  return scale
}

export default function linear(..._args: unknown[]): ContinuousScale {
  const scale = continuous()

  scale.copy = function (): ContinuousScale {
    return copy(scale, linear())
  }

  initRange.apply(scale, arguments as unknown as [])

  return linearish(scale)
}
