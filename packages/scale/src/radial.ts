import continuous from './continuous.ts'
import { initRange } from './init.ts'
import { linearish } from './linear.ts'
import number from './number.ts'

function square(x: number): number {
  return Math.sign(x) * x * x
}

function unsquare(x: number): number {
  return Math.sign(x) * Math.sqrt(Math.abs(x))
}

export default function radial(..._args: any[]): any {
  const squared = continuous()
  let range = [0, 1]
  let round = false
  let unknown: any

  function scale(x: any): any {
    const y = unsquare(squared(x))
    return isNaN(y) ? unknown : round ? Math.round(y) : y
  }

  scale.invert = function (y: any): any {
    return squared.invert(square(y))
  }

  scale.domain = function (_?: any): any {
    return arguments.length ? (squared.domain(_), scale) : squared.domain()
  }

  scale.range = function (_?: any): any {
    return arguments.length ? (squared.range((range = Array.from(_, number)).map(square)), scale) : range.slice()
  }

  scale.rangeRound = function (_: any): any {
    return scale.range(_).round(true)
  }

  scale.round = function (_?: any): any {
    return arguments.length ? (round = !!_, scale) : round
  }

  scale.clamp = function (_?: any): any {
    return arguments.length ? (squared.clamp(_), scale) : squared.clamp()
  }

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : unknown
  }

  scale.copy = function (): any {
    return radial(squared.domain(), range)
      .round(round)
      .clamp(squared.clamp())
      .unknown(unknown)
  }

  initRange.apply(scale, arguments as any)

  return linearish(scale)
}
