import continuous, { type ContinuousScale } from './continuous.ts'
import { initRange } from './init.ts'
import { linearish } from './linear.ts'
import number from './number.ts'

function square(x: number): number {
  return Math.sign(x) * x * x
}

function unsquare(x: number): number {
  return Math.sign(x) * Math.sqrt(Math.abs(x))
}

export default function radial(..._args: unknown[]): ContinuousScale {
  const squared = continuous()
  let range = [0, 1]
  let round = false
  let unknown: unknown

  function scale(x: number): number {
    const y = unsquare(squared(x))
    return isNaN(y) ? unknown as number : round ? Math.round(y) : y
  }

  scale.invert = function (y: number): number {
    return squared.invert(square(y))
  }

  scale.domain = function (_?: Iterable<unknown>): number[] | ContinuousScale {
    return arguments.length ? (squared.domain(_!), scale as unknown as ContinuousScale) : squared.domain()
  }

  scale.range = function (_?: Iterable<unknown>): number[] | ContinuousScale {
    return arguments.length ? (squared.range((range = Array.from(_!, number)).map(square)), scale as unknown as ContinuousScale) : range.slice()
  }

  scale.rangeRound = function (_: Iterable<unknown>): ContinuousScale {
    return (scale as unknown as ContinuousScale).range(_).round(true)
  }

  scale.round = function (_?: boolean): boolean | ContinuousScale {
    return arguments.length ? (round = !!_, scale as unknown as ContinuousScale) : round
  }

  scale.clamp = function (_?: boolean): boolean | ContinuousScale {
    return arguments.length ? (squared.clamp(_!), scale as unknown as ContinuousScale) : squared.clamp()
  }

  scale.unknown = function (_?: unknown): unknown | ContinuousScale {
    return arguments.length ? (unknown = _, scale as unknown as ContinuousScale) : unknown
  }

  scale.copy = function (): ContinuousScale {
    return radial(squared.domain(), range)
      .round!(round)
      .clamp(squared.clamp())
      .unknown(unknown)
  }

  initRange.apply(scale as unknown as Record<string, unknown>, arguments as unknown as [])

  return linearish(scale as unknown as ContinuousScale)
}
