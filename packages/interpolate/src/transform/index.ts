import number from '../number.ts'
import { parseCss, parseSvg } from './parse.ts'
import type { DecomposeResult } from './decompose.ts'

function interpolateTransform(
  parse: (value: string) => DecomposeResult,
  // eslint-disable-next-line pickier/no-unused-vars
  pxComma: string,
  pxParen: string,
  degParen: string,
): (a: any, b: any) => (t: number) => string {

  function pop(s: (string | null)[]): string {
    return s.length ? `${s.pop()} ` : ''
  }

  function translate(xa: number, ya: number, xb: number, yb: number, s: (string | null)[], q: { i: number, x: (t: number) => number }[]): void {
    if (xa !== xb || ya !== yb) {
      const i = s.push('translate(', null, pxComma, null, pxParen)
      q.push({ i: i - 4, x: number(xa, xb) }, { i: i - 2, x: number(ya, yb) })
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else if (xb || yb) {
      // eslint-disable-next-line pickier/no-unused-vars
      s.push(`translate(${xb}${pxComma}${yb}${pxParen}`)
    }
  }

  function rotate(a: number, b: number, s: (string | null)[], q: { i: number, x: (t: number) => number }[]): void {
    if (a !== b) {
      // eslint-disable-next-line pickier/no-unused-vars
      if (a - b > 180) b += 360; else if (b - a > 180) a += 360 // shortest path
      q.push({ i: s.push(`${pop(s)}rotate(`, null, degParen) - 2, x: number(a, b) })
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else if (b) {
      // eslint-disable-next-line pickier/no-unused-vars
      s.push(`${pop(s)}rotate(${b}${degParen}`)
    }
  }

  function skewX(a: number, b: number, s: (string | null)[], q: { i: number, x: (t: number) => number }[]): void {
    if (a !== b) {
      q.push({ i: s.push(`${pop(s)}skewX(`, null, degParen) - 2, x: number(a, b) })
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else if (b) {
      // eslint-disable-next-line pickier/no-unused-vars
      s.push(`${pop(s)}skewX(${b}${degParen}`)
    }
  }

  function scale(xa: number, ya: number, xb: number, yb: number, s: (string | null)[], q: { i: number, x: (t: number) => number }[]): void {
    if (xa !== xb || ya !== yb) {
      const i = s.push(`${pop(s)}scale(`, null, ',', null, ')')
      q.push({ i: i - 4, x: number(xa, xb) }, { i: i - 2, x: number(ya, yb) })
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else if (xb !== 1 || yb !== 1) {
      // eslint-disable-next-line pickier/no-unused-vars
      s.push(`${pop(s)}scale(${xb},${yb})`)
    }
  }

  return function (a: string, b: string): (t: number) => string {
    const s: (string | null)[] = [] // string constants and placeholders
    const q: { i: number, x: (t: number) => number }[] = [] // number interpolators
    const pa = parse(a)
    const pb = parse(b)
    translate(pa.translateX, pa.translateY, pb.translateX, pb.translateY, s, q)
    rotate(pa.rotate, pb.rotate, s, q)
    skewX(pa.skewX, pb.skewX, s, q)
    scale(pa.scaleX, pa.scaleY, pb.scaleX, pb.scaleY, s, q)
    return function (t: number): string {
      let i = -1
      const n = q.length
      let o: { i: number, x: (t: number) => number }
      while (++i < n) s[(o = q[i]).i] = o.x(t) as unknown as string
      return s.join('')
    }
  }
}

export const interpolateTransformCss: (a: string, b: string) => (t: number) => string = interpolateTransform(parseCss, 'px, ', 'px)', 'deg)')
export const interpolateTransformSvg: (a: string, b: string) => (t: number) => string = interpolateTransform(parseSvg as (value: string) => DecomposeResult, ', ', ')', ')')
