import { type ContinuousScale } from './continuous.ts'
import { linearish } from './linear.ts'
import number from './number.ts'

export default function identity(domain?: Iterable<unknown>): ContinuousScale {
  let unknown: unknown
  let _domain: number[]

  function scale(x: number): number {
    return x == null || isNaN(x = +x) ? unknown as number : x
  }

  scale.invert = scale

  scale.domain = scale.range = function (_?: Iterable<unknown>): number[] | ContinuousScale {
    return arguments.length ? (_domain = Array.from(_!, number), scale as unknown as ContinuousScale) : _domain.slice()
  }

  scale.unknown = function (_?: unknown): unknown | ContinuousScale {
    return arguments.length ? (unknown = _, scale as unknown as ContinuousScale) : unknown
  }

  scale.copy = function (): ContinuousScale {
    return identity(_domain).unknown(unknown)
  }

  _domain = arguments.length ? Array.from(domain!, number) : [0, 1]

  return linearish(scale as unknown as ContinuousScale)
}
