import { linearish } from './linear.ts'
import { copy, identity, transformer, type ContinuousScale } from './continuous.ts'
import { initRange } from './init.ts'

// eslint-disable-next-line pickier/no-unused-vars
type TransformFn = (x: number) => number

function transformPow(exponent: number): TransformFn {
  return function (x: number): number {
    return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent)
  }
}

function transformSqrt(x: number): number {
  return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x)
}

function transformSquare(x: number): number {
  return x < 0 ? -x * x : x * x
}

export function powish(transform: (t: TransformFn, u: TransformFn) => ContinuousScale): ContinuousScale {
  const scale = transform(identity, identity)
  let exponent = 1

  function rescale(): ContinuousScale {
    return exponent === 1 ? transform(identity, identity)
      : exponent === 0.5 ? transform(transformSqrt, transformSquare)
      : transform(transformPow(exponent), transformPow(1 / exponent))
  }

  scale.exponent = function (_?: number): number | ContinuousScale {
    return arguments.length ? (exponent = +_!, rescale()) : exponent
  }

  return linearish(scale)
}

export default function pow(): ContinuousScale {
  const scale = powish(transformer())

  scale.copy = function (): ContinuousScale {
    return copy(scale, pow()).exponent!(scale.exponent!())
  }

  initRange.apply(scale, arguments as unknown as [])

  return scale
}

export function sqrt(): ContinuousScale {
  return pow.apply(null, arguments as unknown as []).exponent!(0.5) as ContinuousScale
}
