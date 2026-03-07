import { interpolate, interpolateRound } from '@ts-charts/interpolate'
import { identity } from './continuous.ts'
import { initInterpolator } from './init.ts'
import { linearish } from './linear.ts'
import { loggish } from './log.ts'
import { symlogish } from './symlog.ts'
import { powish } from './pow.ts'

function transformer(): any {
  let x0 = 0
  let x1 = 1
  let t0: number
  let t1: number
  let k10: number
  let transform: any
  let interpolator: any = identity
  let clamp = false
  let unknown: any

  function scale(x: any): any {
    return x == null || isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x))
  }

  scale.domain = function (_?: any): any {
    return arguments.length ? ([x0, x1] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1]
  }

  scale.clamp = function (_?: any): any {
    return arguments.length ? (clamp = !!_, scale) : clamp
  }

  scale.interpolator = function (_?: any): any {
    return arguments.length ? (interpolator = _, scale) : interpolator
  }

  function range(interpolate: any): any {
    return function (_?: any): any {
      let r0: any, r1: any
      return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)]
    }
  }

  scale.range = range(interpolate)

  scale.rangeRound = range(interpolateRound)

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : unknown
  }

  return function (t: any): any {
    transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0)
    return scale
  }
}

export function copy(source: any, target: any): any {
  return target
    .domain(source.domain())
    .interpolator(source.interpolator())
    .clamp(source.clamp())
    .unknown(source.unknown())
}

export default function sequential(): any {
  const scale = linearish(transformer()(identity))

  scale.copy = function (): any {
    return copy(scale, sequential())
  }

  return initInterpolator.apply(scale, arguments as any)
}

export function sequentialLog(): any {
  const scale = loggish(transformer()).domain([1, 10])

  scale.copy = function (): any {
    return copy(scale, sequentialLog()).base(scale.base())
  }

  return initInterpolator.apply(scale, arguments as any)
}

export function sequentialSymlog(): any {
  const scale = symlogish(transformer())

  scale.copy = function (): any {
    return copy(scale, sequentialSymlog()).constant(scale.constant())
  }

  return initInterpolator.apply(scale, arguments as any)
}

export function sequentialPow(): any {
  const scale = powish(transformer())

  scale.copy = function (): any {
    return copy(scale, sequentialPow()).exponent(scale.exponent())
  }

  return initInterpolator.apply(scale, arguments as any)
}

export function sequentialSqrt(): any {
  return sequentialPow.apply(null, arguments as any).exponent(0.5)
}
