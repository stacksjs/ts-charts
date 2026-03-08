import { interpolate, interpolateRound } from '@ts-charts/interpolate'
import { identity, type ContinuousScale } from './continuous.ts'
import { initInterpolator } from './init.ts'
import { linearish } from './linear.ts'
import { loggish } from './log.ts'
import { symlogish } from './symlog.ts'
import { powish } from './pow.ts'

type TransformFn = (x: number) => number
type InterpolatorFn = (t: number) => number

function transformer(): (t: TransformFn) => ContinuousScale {
  let x0 = 0
  let x1 = 1
  let t0: number
  let t1: number
  let k10: number
  let transform: TransformFn
  let interpolator: InterpolatorFn = identity as InterpolatorFn
  let clamp = false
  let unknown: unknown

  function scale(x: number): number {
    return x == null || isNaN(x = +x) ? unknown as number : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x))
  }

  scale.domain = function (_?: Iterable<number>): [number, number] | ContinuousScale {
    return arguments.length ? ([x0, x1] = Array.from(_!) as [number, number], t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale as unknown as ContinuousScale) : [x0, x1]
  }

  scale.clamp = function (_?: boolean): boolean | ContinuousScale {
    return arguments.length ? (clamp = !!_, scale as unknown as ContinuousScale) : clamp
  }

  scale.interpolator = function (_?: InterpolatorFn): InterpolatorFn | ContinuousScale {
    return arguments.length ? (interpolator = _!, scale as unknown as ContinuousScale) : interpolator
  }

  function range(interpolateFn: (a: number, b: number) => (t: number) => number): (_?: Iterable<number>) => [number, number] | ContinuousScale {
    return function (_?: Iterable<number>): [number, number] | ContinuousScale {
      let r0: number, r1: number
      return arguments.length ? ([r0, r1] = Array.from(_!) as [number, number], interpolator = interpolateFn(r0, r1), scale as unknown as ContinuousScale) : [interpolator(0), interpolator(1)]
    }
  }

  scale.range = range(interpolate as unknown as (a: number, b: number) => (t: number) => number)

  scale.rangeRound = range(interpolateRound)

  scale.unknown = function (_?: unknown): unknown | ContinuousScale {
    return arguments.length ? (unknown = _, scale as unknown as ContinuousScale) : unknown
  }

  return function (t: TransformFn): ContinuousScale {
    transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0)
    return scale as unknown as ContinuousScale
  }
}

export function copy(source: ContinuousScale, target: ContinuousScale): ContinuousScale {
  // Sequential scales use .interpolator() instead of .interpolate()
  const src = source as Record<string, (...args: unknown[]) => unknown>
  const tgt = target as Record<string, (...args: unknown[]) => unknown>
  tgt.domain(src.domain())
  tgt.interpolator(src.interpolator())
  tgt.clamp(src.clamp())
  tgt.unknown(src.unknown())
  return target
}

export default function sequential(): ContinuousScale {
  const scale = linearish(transformer()(identity as TransformFn))

  scale.copy = function (): ContinuousScale {
    return copy(scale, sequential())
  }

  return initInterpolator.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}

export function sequentialLog(): ContinuousScale {
  const scale = loggish(transformer() as unknown as Parameters<typeof loggish>[0]).domain([1, 10]) as ContinuousScale

  scale.copy = function (): ContinuousScale {
    return copy(scale, sequentialLog()).base!(scale.base!() as number) as ContinuousScale
  }

  return initInterpolator.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}

export function sequentialSymlog(): ContinuousScale {
  const scale = symlogish(transformer() as unknown as Parameters<typeof symlogish>[0])

  scale.copy = function (): ContinuousScale {
    return copy(scale, sequentialSymlog()).constant!(scale.constant!() as number) as ContinuousScale
  }

  return initInterpolator.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}

export function sequentialPow(): ContinuousScale {
  const scale = powish(transformer() as unknown as Parameters<typeof powish>[0])

  scale.copy = function (): ContinuousScale {
    return copy(scale, sequentialPow()).exponent!(scale.exponent!() as number) as ContinuousScale
  }

  return initInterpolator.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}

export function sequentialSqrt(): ContinuousScale {
  return sequentialPow.apply(null, arguments as unknown as []).exponent!(0.5) as ContinuousScale
}
