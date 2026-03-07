import { range as sequence } from '@ts-charts/array'
import { initRange } from './init.ts'
import ordinal from './ordinal.ts'

export default function band(..._args: any[]): any {
  const scale = ordinal().unknown(undefined)
  const domain = scale.domain
  const ordinalRange = scale.range
  let r0 = 0
  let r1 = 1
  let step: number
  let bandwidth: number
  let round = false
  let paddingInner = 0
  let paddingOuter = 0
  let align = 0.5

  delete scale.unknown

  function rescale(): any {
    const n = domain().length
    const reverse = r1 < r0
    const start0 = reverse ? r1 : r0
    const stop = reverse ? r0 : r1
    let start = start0
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2)
    if (round) step = Math.floor(step)
    start += (stop - start - step * (n - paddingInner)) * align
    bandwidth = step * (1 - paddingInner)
    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth)
    const values = sequence(n).map(function (i: number): number { return start + step * i })
    return ordinalRange(reverse ? values.reverse() : values)
  }

  scale.domain = function (_?: any): any {
    return arguments.length ? (domain(_), rescale()) : domain()
  }

  scale.range = function (_?: any): any {
    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1]
  }

  scale.rangeRound = function (_: any): any {
    return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale()
  }

  scale.bandwidth = function (): number {
    return bandwidth
  }

  scale.step = function (): number {
    return step
  }

  scale.round = function (_?: any): any {
    return arguments.length ? (round = !!_, rescale()) : round
  }

  scale.padding = function (_?: any): any {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner
  }

  scale.paddingInner = function (_?: any): any {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner
  }

  scale.paddingOuter = function (_?: any): any {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter
  }

  scale.align = function (_?: any): any {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align
  }

  scale.copy = function (): any {
    return band(domain(), [r0, r1])
      .round(round)
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter)
      .align(align)
  }

  return initRange.apply(rescale(), arguments as any)
}

function pointish(scale: any): any {
  const copy = scale.copy

  scale.padding = scale.paddingOuter
  delete scale.paddingInner
  delete scale.paddingOuter

  scale.copy = function (): any {
    return pointish(copy())
  }

  return scale
}

export function point(): any {
  return pointish(band.apply(null, arguments as any).paddingInner(1))
}
