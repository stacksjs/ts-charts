import number from './number.ts'

const reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g
const reB = new RegExp(reA.source, 'g')

function zero(b: string): () => string {
  return function (): string {
    return b
  }
}

function one(b: (t: number) => number): (t: number) => string {
  return function (t: number): string {
    return `${b(t)}`
  }
}

export default function interpolateString(a: unknown, b: unknown): (t: number) => string {
  let bi = reA.lastIndex = reB.lastIndex = 0 // scan index for next number in b
  let am: RegExpExecArray | null // current match in a
  let bm: RegExpExecArray | null // current match in b
  let bs: string // string preceding current number in b, if any
  let i = -1 // index in s
  const s: (string | null)[] = [] // string constants and placeholders
  const q: { i: number, x: (t: number) => number }[] = [] // number interpolators

  // Coerce inputs to strings.
  // eslint-disable-next-line pickier/no-unused-vars
  const sa = `${a}`
  // eslint-disable-next-line pickier/no-unused-vars
  let sb = `${b}`

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(sa))
      && (bm = reB.exec(sb))) {
    if ((bs = bm.index as any) > bi) { // a string precedes the next number in b
      bs = sb.slice(bi, bs as unknown as number)
      if (s[i]) s[i] += bs // coalesce with previous string
      else s[++i] = bs
    }
    if ((am as unknown as string) === (bm as unknown as string)) { // numbers in a & b match
      if (s[i]) s[i] += bm[0] // coalesce with previous string
      else s[++i] = bm[0]
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else { // interpolate non-matching numbers
      s[++i] = null
      q.push({ i, x: number(+am[0], +bm[0]) })
    }
    bi = reB.lastIndex
  }

  // Add remains of b.
  if (bi < sb.length) {
    bs = sb.slice(bi)
    if (s[i]) s[i] += bs // coalesce with previous string
    else s[++i] = bs
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(sb))
      // eslint-disable-next-line pickier/no-unused-vars
      : (sb = q.length as unknown as string, function (t: number): string {
          for (let i = 0, o: { i: number, x: (t: number) => number }; i < (sb as unknown as number); ++i) s[(o = q[i]).i] = o.x(t) as unknown as string
          return s.join('')
        })
}
