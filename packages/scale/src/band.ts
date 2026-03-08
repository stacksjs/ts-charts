import { range as sequence } from '@ts-charts/array'
import { initRange } from './init.ts'
import ordinal, { type OrdinalScale } from './ordinal.ts'

/**
 * Band scale interface. Getter/setter methods use `any` for the same
 * reason as ContinuousScale -- the D3 pattern of polymorphic returns
 * and string-coercible numeric inputs.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BandScale {
  (d: unknown): unknown
  domain(...args: any[]): any
  range(...args: any[]): any
  rangeRound(...args: any[]): any
  bandwidth(): number
  step(): number
  round(...args: any[]): any
  padding(...args: any[]): any
  paddingInner?(...args: any[]): any
  paddingOuter?(...args: any[]): any
  align(...args: any[]): any
  copy(): BandScale
  [key: string]: unknown
}

export default function band(..._args: unknown[]): BandScale {
  const scale = ordinal().unknown(undefined) as OrdinalScale
  const domain = scale.domain as (() => unknown[]) & ((_: Iterable<unknown>) => OrdinalScale)
  const ordinalRange = scale.range as (() => unknown[]) & ((_: Iterable<unknown>) => OrdinalScale)
  let r0 = 0
  let r1 = 1
  let step: number
  let bandwidth: number
  let round = false
  let paddingInner = 0
  let paddingOuter = 0
  let align = 0.5

  delete (scale as Record<string, unknown>).unknown

  function rescale(): BandScale {
    const n = (domain() as unknown[]).length
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
    ordinalRange(reverse ? values.reverse() : values)
    return scale as unknown as BandScale
  }

  const s = scale as unknown as Record<string, unknown>

  s.domain = function (_?: Iterable<unknown>): unknown[] | BandScale {
    return arguments.length ? (domain(_!), rescale()) : domain()
  }

  s.range = function (_?: Iterable<number>): [number, number] | BandScale {
    return arguments.length ? ([r0, r1] = Array.from(_!) as [number, number], r0 = +r0, r1 = +r1, rescale()) : [r0, r1]
  }

  s.rangeRound = function (_: Iterable<number>): BandScale {
    return [r0, r1] = Array.from(_) as [number, number], r0 = +r0, r1 = +r1, round = true, rescale()
  }

  s.bandwidth = function (): number {
    return bandwidth
  }

  s.step = function (): number {
    return step
  }

  s.round = function (_?: boolean): boolean | BandScale {
    return arguments.length ? (round = !!_, rescale()) : round
  }

  s.padding = function (_?: number): number | BandScale {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_!), rescale()) : paddingInner
  }

  s.paddingInner = function (_?: number): number | BandScale {
    return arguments.length ? (paddingInner = Math.min(1, +_!), rescale()) : paddingInner
  }

  s.paddingOuter = function (_?: number): number | BandScale {
    return arguments.length ? (paddingOuter = +_!, rescale()) : paddingOuter
  }

  s.align = function (_?: number): number | BandScale {
    return arguments.length ? (align = Math.max(0, Math.min(1, +_!)), rescale()) : align
  }

  s.copy = function (): BandScale {
    const s = band().domain(domain()).range([r0, r1]) as BandScale
    s.round(round)
    s.paddingInner!(paddingInner)
    s.paddingOuter!(paddingOuter)
    s.align(align)
    return s
  }

  return initRange.apply(rescale(), arguments as unknown as []) as unknown as BandScale
}

function pointish(scale: BandScale): BandScale {
  const copy = scale.copy

  scale.padding = scale.paddingOuter as BandScale['padding']
  delete scale.paddingInner
  delete scale.paddingOuter

  scale.copy = function (): BandScale {
    return pointish(copy())
  }

  return scale
}

export function point(..._args: unknown[]): BandScale {
  return pointish(band.apply(null, arguments as unknown as []).paddingInner!(1) as BandScale)
}
