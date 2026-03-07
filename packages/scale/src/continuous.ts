import { bisect } from '@ts-charts/array'
import { interpolate as interpolateValue, interpolateNumber, interpolateRound } from '@ts-charts/interpolate'
import constant from './constant.ts'
import number from './number.ts'

const unit = [0, 1]

export function identity(x: any): any {
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
function bimap(domain: any[], range: any[], interpolate: any): (x: any) => any {
  let d0 = domain[0]
  let d1 = domain[1]
  let r0 = range[0]
  let r1 = range[1]
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0)
  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1)
  return function (x: any): any { return r0(d0(x)) }
}

function polymap(domain: any[], range: any[], interpolate: any): (x: any) => any {
  const j = Math.min(domain.length, range.length) - 1
  const d = new Array(j)
  const r = new Array(j)
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

  return function (x: any): any {
    const i = bisect(domain, x, 1, j) - 1
    return r[i](d[i](x))
  }
}

export function copy(source: any, target: any): any {
  return target
    .domain(source.domain())
    .range(source.range())
    .interpolate(source.interpolate())
    .clamp(source.clamp())
    .unknown(source.unknown())
}

export function transformer(): any {
  let domain: any[] = unit
  let range: any[] = unit
  let interpolate: any = interpolateValue
  let transform: any
  let untransform: any
  let unknown: any
  let clamp: any = identity
  let piecewise: any
  let output: any
  let input: any

  function rescale(): any {
    const n = Math.min(domain.length, range.length)
    if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1])
    piecewise = n > 2 ? polymap : bimap
    output = input = null
    return scale
  }

  function scale(x: any): any {
    return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)))
  }

  scale.invert = function (y: any): any {
    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)))
  }

  scale.domain = function (_?: any): any {
    return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice()
  }

  scale.range = function (_?: any): any {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice()
  }

  scale.rangeRound = function (_: any): any {
    return range = Array.from(_), interpolate = interpolateRound, rescale()
  }

  scale.clamp = function (_?: any): any {
    return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity
  }

  scale.interpolate = function (_?: any): any {
    return arguments.length ? (interpolate = _, rescale()) : interpolate
  }

  scale.unknown = function (_?: any): any {
    return arguments.length ? (unknown = _, scale) : unknown
  }

  return function (t: any, u: any): any {
    transform = t, untransform = u
    return rescale()
  }
}

export default function continuous(): any {
  return transformer()(identity, identity)
}
