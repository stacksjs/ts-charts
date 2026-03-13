import { linearish } from './linear.ts'
import { copy, transformer, type ContinuousScale } from './continuous.ts'
import { initRange } from './init.ts'

// eslint-disable-next-line pickier/no-unused-vars
type TransformFn = (x: number) => number

function transformSymlog(c: number): TransformFn {
  return function (x: number): number {
    return Math.sign(x) * Math.log1p(Math.abs(x / c))
  }
}

function transformSymexp(c: number): TransformFn {
  return function (x: number): number {
    return Math.sign(x) * Math.expm1(Math.abs(x)) * c
  }
}

export function symlogish(transform: (t: TransformFn, u: TransformFn) => ContinuousScale): ContinuousScale {
  let c = 1
  const scale = transform(transformSymlog(c), transformSymexp(c))

  scale.constant = function (_?: number): number | ContinuousScale {
    return arguments.length ? transform(transformSymlog(c = +_!), transformSymexp(c)) : c
  }

  return linearish(scale)
}

export default function symlog(): ContinuousScale {
  const scale = symlogish(transformer())

  scale.copy = function (): ContinuousScale {
    return copy(scale, symlog()).constant!(scale.constant!() as number) as ContinuousScale
  }

  return initRange.apply(scale, arguments as unknown as []) as unknown as ContinuousScale
}
