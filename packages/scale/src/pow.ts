import { linearish } from './linear.ts'
import { copy, identity, transformer } from './continuous.ts'
import { initRange } from './init.ts'

function transformPow(exponent: number): (x: number) => number {
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

export function powish(transform: any): any {
  const scale = transform(identity, identity)
  let exponent = 1

  function rescale(): any {
    return exponent === 1 ? transform(identity, identity)
      : exponent === 0.5 ? transform(transformSqrt, transformSquare)
      : transform(transformPow(exponent), transformPow(1 / exponent))
  }

  scale.exponent = function (_?: any): any {
    return arguments.length ? (exponent = +_, rescale()) : exponent
  }

  return linearish(scale)
}

export default function pow(): any {
  const scale = powish(transformer())

  scale.copy = function (): any {
    return copy(scale, pow()).exponent(scale.exponent())
  }

  initRange.apply(scale, arguments as any)

  return scale
}

export function sqrt(): any {
  return pow.apply(null, arguments as any).exponent(0.5)
}
