import { linearish } from './linear.ts'
import { copy, transformer } from './continuous.ts'
import { initRange } from './init.ts'

function transformSymlog(c: number): (x: number) => number {
  return function (x: number): number {
    return Math.sign(x) * Math.log1p(Math.abs(x / c))
  }
}

function transformSymexp(c: number): (x: number) => number {
  return function (x: number): number {
    return Math.sign(x) * Math.expm1(Math.abs(x)) * c
  }
}

export function symlogish(transform: any): any {
  let c = 1
  const scale = transform(transformSymlog(c), transformSymexp(c))

  scale.constant = function (_?: any): any {
    return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c
  }

  return linearish(scale)
}

export default function symlog(): any {
  const scale = symlogish(transformer())

  scale.copy = function (): any {
    return copy(scale, symlog()).constant(scale.constant())
  }

  return initRange.apply(scale, arguments as any)
}
