import { interpolate, interpolateRound, piecewise } from '@ts-charts/interpolate'
import { identity, type ContinuousScale } from './continuous.ts'
import { initInterpolator } from './init.ts'
import { linearish } from './linear.ts'
import { loggish } from './log.ts'
import { copy } from './sequential.ts'
import { symlogish } from './symlog.ts'
import { powish } from './pow.ts'

// eslint-disable-next-line pickier/no-unused-vars
type TransformFn = (x: number) => number
// eslint-disable-next-line pickier/no-unused-vars
type InterpolatorFn = (t: number) => number

function transformer(): (t: TransformFn) => ContinuousScale {
  let x0 = 0
  let x1 = 0.5
  let x2 = 1
  let s = 1
  let t0: number
  let t1: number
  let t2: number
  let k10: number
  let k21: number
  let interpolator: InterpolatorFn = identity as InterpolatorFn
  let transform: TransformFn
  let clamp = false
  let unknown: unknown

  function scale(x: number): number {
    return isNaN(x = +x) ? unknown as number : (x = 0.5 + ((x = +transform(x)) - t1) * (s * x < s * t1 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x)) : x))
  }

  scale.domain = function (_?: Iterable<number>): [number, number, number] | ContinuousScale {
    return arguments.length ? ([x0, x1, x2] = Array.from(_!) as [number, number, number], t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), t2 = transform(x2 = +x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1, scale as unknown as ContinuousScale) : [x0, x1, x2]
  }

  scale.clamp = function (_?: boolean): boolean | ContinuousScale {
    return arguments.length ? (clamp = !!_, scale as unknown as ContinuousScale) : clamp
  }

  scale.interpolator = function (_?: InterpolatorFn): InterpolatorFn | ContinuousScale {
    return arguments.length ? (interpolator = _!, scale as unknown as ContinuousScale) : interpolator
  }

  function range(interpolateFn: (a: number, b: number) => (t: number) => number): (_?: Iterable<number>) => [number, number, number] | ContinuousScale {
    return function (_?: Iterable<number>): [number, number, number] | ContinuousScale {
      let r0: number, r1: number, r2: number
      // eslint-disable-next-line pickier/no-unused-vars
      return arguments.length ? ([r0, r1, r2] = Array.from(_!) as [number, number, number], interpolator = piecewise(interpolateFn as (a: unknown, b: unknown) => (t: number) => unknown, [r0, r1, r2]) as unknown as InterpolatorFn, scale as unknown as ContinuousScale) : [interpolator(0), interpolator(0.5), interpolator(1)]
    }
  }

  // eslint-disable-next-line pickier/no-unused-vars
  scale.range = range(interpolate as unknown as (a: number, b: number) => (t: number) => number)

  scale.rangeRound = range(interpolateRound)

  scale.unknown = function (_?: unknown): unknown | ContinuousScale {
    return arguments.length ? (unknown = _, scale as unknown as ContinuousScale) : unknown
  }

  return function (t: TransformFn): ContinuousScale {
    transform = t, t0 = t(x0), t1 = t(x1), t2 = t(x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1
    return scale as unknown as ContinuousScale
  }
}

export default function diverging(): ContinuousScale {
  const scale = linearish(transformer()(identity as TransformFn))

  scale.copy = function (): ContinuousScale {
    return copy(scale, diverging())
  }

  return initInterpolator.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}

export function divergingLog(): ContinuousScale {
  const scale = loggish(transformer() as unknown as Parameters<typeof loggish>[0]).domain([0.1, 1, 10]) as ContinuousScale

  scale.copy = function (): ContinuousScale {
    return copy(scale, divergingLog()).base!(scale.base!() as number) as ContinuousScale
  }

  return initInterpolator.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}

export function divergingSymlog(): ContinuousScale {
  const scale = symlogish(transformer() as unknown as Parameters<typeof symlogish>[0])

  scale.copy = function (): ContinuousScale {
    return copy(scale, divergingSymlog()).constant!(scale.constant!() as number) as ContinuousScale
  }

  return initInterpolator.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}

export function divergingPow(): ContinuousScale {
  const scale = powish(transformer() as unknown as Parameters<typeof powish>[0])

  scale.copy = function (): ContinuousScale {
    return copy(scale, divergingPow()).exponent!(scale.exponent!() as number) as ContinuousScale
  }

  return initInterpolator.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}

export function divergingSqrt(): ContinuousScale {
  return divergingPow.apply(null, arguments as unknown as []).exponent!(0.5) as ContinuousScale
}
