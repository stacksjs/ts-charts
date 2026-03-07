import { linearish } from './linear.ts'
import number from './number.ts'

export default function identity(domain?: any): any {
  let unknown: any

  function scale(x: any): any {
    return x == null || isNaN(x = +x) ? unknown : x
  }

  scale.invert = scale

  scale.domain = scale.range = function (_?: any): any {
    return arguments.length ? (domain = Array.from(_, number), scale) : domain.slice()
  }

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : unknown
  }

  scale.copy = function (): any {
    return identity(domain).unknown(unknown)
  }

  domain = arguments.length ? Array.from(domain, number) : [0, 1]

  return linearish(scale)
}
