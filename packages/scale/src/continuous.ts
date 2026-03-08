import { bisect } from '@ts-charts/array'
import { interpolate as interpolateValue, interpolateNumber, interpolateRound } from '@ts-charts/interpolate'
import constant from './constant.ts'
import number from './number.ts'

type InterpolateFn = (a: number, b: number) => (t: number) => number
type TransformFn = (x: number) => number
type PiecewiseFn = (domain: number[], range: number[], interpolate: InterpolateFn) => (x: number) => number

/**
 * D3-style scale interface. Methods use getter/setter pattern where
 * calling with no args returns the current value, and calling with args
 * sets the value and returns the scale for chaining. The `any` return
 * types on getter/setter methods are intentional — they reflect the
 * genuinely polymorphic return (e.g., `domain()` returns `number[]`,
 * `domain([1,2])` returns `ContinuousScale`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ContinuousScale {
  (x: number): number
  invert(y: number): number
  domain(...args: any[]): any
  range(...args: any[]): any
  rangeRound(...args: any[]): any
  clamp(...args: any[]): any
  interpolate(...args: any[]): any
  unknown(...args: any[]): any
  copy(...args: any[]): any
  ticks?(count?: number): number[]
  tickFormat?(...args: any[]): any
  nice?(...args: any[]): any
  // Optional methods added by variant scales (log, pow, symlog)
  base?(...args: any[]): any
  exponent?(...args: any[]): any
  constant?(...args: any[]): any
  round?(...args: any[]): any
  // Allow dynamic property assignment for scale augmentation
  [key: string]: any
}

const unit = [0, 1]

export function identity<T>(x: T): T {
  return x
}

function normalize(a: number, b: number): (x: number) => number {
  return (b -= (a = +a))
    ? function (x: number): number { return (x - a) / b }
    : constant(isNaN(b) ? NaN : 0.5)
}

function clamper(a: number, b: number): (x: number) => number {
  let t: number
  if (a > b) t = a, a = b, b = t
  return function (x: number): number { return Math.max(a, Math.min(b, x)) }
}

// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
function bimap(domain: number[], range: number[], interpolate: InterpolateFn): (x: number) => number {
  const d0n = domain[0]
  const d1 = domain[1]
  const r0n = range[0]
  const r1 = range[1]
  let d0: (x: number) => number
  let r0: (t: number) => number
  if (d1 < d0n) d0 = normalize(d1, d0n), r0 = interpolate(r1, r0n)
  else d0 = normalize(d0n, d1), r0 = interpolate(r0n, r1)
  return function (x: number): number { return r0(d0(x)) }
}

function polymap(domain: number[], range: number[], interpolate: InterpolateFn): (x: number) => number {
  const j = Math.min(domain.length, range.length) - 1
  const d = new Array<(x: number) => number>(j)
  const r = new Array<(t: number) => number>(j)
  let i = -1

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse()
    range = range.slice().reverse()
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1])
    r[i] = interpolate(range[i], range[i + 1])
  }

  return function (x: number): number {
    const i = bisect(domain, x, 1, j) - 1
    return r[i](d[i](x))
  }
}

export function copy(source: ContinuousScale, target: ContinuousScale): ContinuousScale {
  return target
    .domain(source.domain())
    .range(source.range())
    .interpolate(source.interpolate())
    .clamp(source.clamp())
    .unknown(source.unknown())
}

export function transformer(): (t: TransformFn, u: TransformFn) => ContinuousScale {
  let domain: number[] = unit
  let range: number[] = unit
  let interpolate: InterpolateFn = interpolateValue as unknown as InterpolateFn
  let transform: TransformFn
  let untransform: TransformFn
  let unknown: unknown
  // clamp is either `identity` (no clamping) or a sentinel/clamper function.
  // When set to a non-identity value, rescale() replaces it with clamper().
  let clamp: TransformFn | true = identity
  let piecewise: PiecewiseFn
  let output: ((x: number) => number) | null
  let input: ((x: number) => number) | null

  function rescale(): ContinuousScale {
    const n = Math.min(domain.length, range.length)
    if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1])
    piecewise = n > 2 ? polymap : bimap
    output = input = null
    return scale as ContinuousScale
  }

  function scale(x: number): number {
    return x == null || isNaN(x = +x) ? unknown as number : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform((clamp as TransformFn)(x)))
  }

  scale.invert = function (y: number): number {
    return (clamp as TransformFn)(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber as unknown as InterpolateFn)))(y)))
  }

  scale.domain = function (_?: Iterable<unknown>): number[] | ContinuousScale {
    return arguments.length ? (domain = Array.from(_!, number), rescale()) : domain.slice()
  }

  scale.range = function (_?: Iterable<number>): number[] | ContinuousScale {
    return arguments.length ? (range = Array.from(_!), rescale()) : range.slice()
  }

  scale.rangeRound = function (_: Iterable<number>): ContinuousScale {
    return range = Array.from(_), interpolate = interpolateRound as unknown as InterpolateFn, rescale()
  }

  scale.clamp = function (_?: boolean): boolean | ContinuousScale {
    return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity
  }

  scale.interpolate = function (_?: InterpolateFn): InterpolateFn | ContinuousScale {
    return arguments.length ? (interpolate = _!, rescale()) : interpolate
  }

  scale.unknown = function (_?: unknown): unknown | ContinuousScale {
    return arguments.length ? (unknown = _, scale as ContinuousScale) : unknown
  }

  return function (t: TransformFn, u: TransformFn): ContinuousScale {
    transform = t, untransform = u
    return rescale()
  }
}

export default function continuous(): ContinuousScale {
  return transformer()(identity, identity)
}
