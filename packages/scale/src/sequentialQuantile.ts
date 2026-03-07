import { ascending, bisect, quantile } from '@ts-charts/array'
import { identity } from './continuous.ts'
import { initInterpolator } from './init.ts'

export default function sequentialQuantile(..._args: any[]): any {
  let domain: number[] = []
  let interpolator: any = identity

  function scale(x: any): any {
    if (x != null && !isNaN(x = +x)) return interpolator((bisect(domain, x, 1) - 1) / (domain.length - 1))
  }

  scale.domain = function (_?: any): any {
    if (!arguments.length) return domain.slice()
    domain = []
    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d)
    domain.sort(ascending)
    return scale
  }

  scale.interpolator = function (_?: any): any {
    return arguments.length ? (interpolator = _, scale) : interpolator
  }

  scale.range = function (): any[] {
    return domain.map((d: number, i: number): any => interpolator(i / (domain.length - 1)))
  }

  scale.quantiles = function (n: number): any[] {
    return Array.from({ length: n + 1 }, (_: any, i: number): any => quantile(domain, i / n))
  }

  scale.copy = function (): any {
    return sequentialQuantile(interpolator).domain(domain)
  }

  return initInterpolator.apply(scale, arguments as any)
}
