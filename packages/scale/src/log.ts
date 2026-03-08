import { ticks } from '@ts-charts/array'
import { format, formatSpecifier } from '@ts-charts/format'
import nice from './nice.ts'
import { copy, transformer, type ContinuousScale } from './continuous.ts'
import { initRange } from './init.ts'

type TransformFn = (x: number) => number

function transformLog(x: number): number {
  return Math.log(x)
}

function transformExp(x: number): number {
  return Math.exp(x)
}

function transformLogn(x: number): number {
  return -Math.log(-x)
}

function transformExpn(x: number): number {
  return -Math.exp(-x)
}

function pow10(x: number): number {
  return isFinite(x) ? +('1e' + x) : x < 0 ? 0 : x
}

function powp(base: number): (x: number) => number {
  return base === 10 ? pow10
    : base === Math.E ? Math.exp
    : (x: number): number => Math.pow(base, x)
}

function logp(base: number): (x: number) => number {
  return base === Math.E ? Math.log
    : base === 10 && Math.log10
    || base === 2 && Math.log2
    || (base = Math.log(base), (x: number): number => Math.log(x) / base)
}

function reflect(f: (x: number, k?: number) => number): (x: number, k?: number) => number {
  return (x: number, k?: number): number => -f(-x, k)
}

export function loggish(transform: (t: TransformFn, u: TransformFn) => ContinuousScale): ContinuousScale {
  const scale = transform(transformLog, transformExp)
  const domain = scale.domain as (() => number[]) & ((_: Iterable<unknown>) => ContinuousScale)
  let base = 10
  let logs: TransformFn
  let pows: TransformFn

  function rescale(): ContinuousScale {
    logs = logp(base), pows = powp(base)
    if ((domain() as number[])[0] < 0) {
      logs = reflect(logs), pows = reflect(pows)
      transform(transformLogn, transformExpn)
    } else {
      transform(transformLog, transformExp)
    }
    return scale
  }

  scale.base = function (_?: number): number | ContinuousScale {
    return arguments.length ? (base = +_!, rescale()) : base
  }

  scale.domain = function (_?: Iterable<unknown>): number[] | ContinuousScale {
    return arguments.length ? (domain(_!), rescale()) : domain()
  }

  scale.ticks = (count?: number): number[] => {
    const d = (domain() as number[])
    let u = d[0]
    let v = d[d.length - 1]
    const r = v < u

    if (r) ([u, v] = [v, u])

    let i = logs(u)
    let j = logs(v)
    let k: number
    let t: number
    const n = count == null ? 10 : +count
    let z: number[] = []

    if (!(base % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j)
      if (u > 0) for (; i <= j; ++i) {
        for (k = 1; k < base; ++k) {
          t = i < 0 ? k / pows(-i) : k * pows(i)
          if (t < u) continue
          if (t > v) break
          z.push(t)
        }
      } else for (; i <= j; ++i) {
        for (k = base - 1; k >= 1; --k) {
          t = i > 0 ? k / pows(-i) : k * pows(i)
          if (t < u) continue
          if (t > v) break
          z.push(t)
        }
      }
      if (z.length * 2 < n) z = ticks(u, v, n)
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(pows)
    }
    return r ? z.reverse() : z
  }

  scale.tickFormat = (count?: number, specifier?: string): (d: number) => string => {
    if (count == null) count = 10
    let formatFn: (d: number) => string
    if (specifier == null) specifier = base === 10 ? 's' : ','
    if (typeof specifier !== 'function') {
      const spec = formatSpecifier(specifier)
      if (!(base % 1) && spec.precision == null) spec.trim = true
      formatFn = format(spec.toString()) as (d: number) => string
    } else {
      formatFn = specifier as unknown as (d: number) => string
    }
    if (count === Infinity) return formatFn
    const k = Math.max(1, base * count / scale.ticks!().length) // TODO fast estimate?
    return (d: number): string => {
      let i = d / pows(Math.round(logs(d)))
      if (i * base < base - 0.5) i *= base
      return i <= k ? formatFn(d) : ''
    }
  }

  scale.nice = (): ContinuousScale => {
    return domain(nice((domain() as number[]), {
      floor: (x: number): number => pows(Math.floor(logs(x))),
      ceil: (x: number): number => pows(Math.ceil(logs(x)))
    }))
  }

  return scale
}

export default function log(): ContinuousScale {
  const scale = loggish(transformer()).domain([1, 10]) as ContinuousScale
  scale.copy = (): ContinuousScale => copy(scale, log()).base!(scale.base!())
  initRange.apply(scale, arguments as unknown as [])
  return scale
}
