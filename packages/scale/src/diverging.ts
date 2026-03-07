import { interpolate, interpolateRound, piecewise } from '@ts-charts/interpolate'
import { identity } from './continuous.ts'
import { initInterpolator } from './init.ts'
import { linearish } from './linear.ts'
import { loggish } from './log.ts'
import { copy } from './sequential.ts'
import { symlogish } from './symlog.ts'
import { powish } from './pow.ts'

function transformer(): any {
  let x0 = 0
  let x1 = 0.5
  let x2 = 1
  let s = 1
  let t0: number
  let t1: number
  let t2: number
  let k10: number
  let k21: number
  let interpolator: any = identity
  let transform: any
  let clamp = false
  let unknown: any

  function scale(x: any): any {
    return isNaN(x = +x) ? unknown : (x = 0.5 + ((x = +transform(x)) - t1) * (s * x < s * t1 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x)) : x))
  }

  scale.domain = function (_?: any): any {
    return arguments.length ? ([x0, x1, x2] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), t2 = transform(x2 = +x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1, scale) : [x0, x1, x2]
  }

  scale.clamp = function (_?: any): any {
    return arguments.length ? (clamp = !!_, scale) : clamp
  }

  scale.interpolator = function (_?: any): any {
    return arguments.length ? (interpolator = _, scale) : interpolator
  }

  function range(interpolate: any): any {
    return function (_?: any): any {
      let r0: any, r1: any, r2: any
      return arguments.length ? ([r0, r1, r2] = _, interpolator = piecewise(interpolate, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)]
    }
  }

  scale.range = range(interpolate)

  scale.rangeRound = range(interpolateRound)

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : unknown
  }

  return function (t: any): any {
    transform = t, t0 = t(x0), t1 = t(x1), t2 = t(x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1
    return scale
  }
}

export default function diverging(..._args: any[]): any {
  const scale = linearish(transformer()(identity))

  scale.copy = function (): any {
    return copy(scale, diverging())
  }

  return initInterpolator.apply(scale, arguments as any)
}

export function divergingLog(): any {
  const scale = loggish(transformer()).domain([0.1, 1, 10])

  scale.copy = function (): any {
    return copy(scale, divergingLog()).base(scale.base())
  }

  return initInterpolator.apply(scale, arguments as any)
}

export function divergingSymlog(): any {
  const scale = symlogish(transformer())

  scale.copy = function (): any {
    return copy(scale, divergingSymlog()).constant(scale.constant())
  }

  return initInterpolator.apply(scale, arguments as any)
}

export function divergingPow(): any {
  const scale = powish(transformer())

  scale.copy = function (): any {
    return copy(scale, divergingPow()).exponent(scale.exponent())
  }

  return initInterpolator.apply(scale, arguments as any)
}

export function divergingSqrt(): any {
  return divergingPow.apply(null, arguments as any).exponent(0.5)
}
