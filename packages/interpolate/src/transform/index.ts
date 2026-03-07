import number from '../number.ts'
import { parseCss, parseSvg } from './parse.ts'
import type { DecomposeResult } from './decompose.ts'

function interpolateTransform(
  parse: (value: any) => DecomposeResult,
  pxComma: string,
  pxParen: string,
  degParen: string,
): (a: any, b: any) => (t: number) => string {

  function pop(s: (string | null)[]): string {
    return s.length ? s.pop() + ' ' : ''
  }

  function translate(xa: number, ya: number, xb: number, yb: number, s: (string | null)[], q: { i: number, x: (t: number) => number }[]): void {
    if (xa !== xb || ya !== yb) {
      const i = s.push('translate(', null, pxComma, null, pxParen)
      q.push({ i: i - 4, x: number(xa, xb) }, { i: i - 2, x: number(ya, yb) })
    } else if (xb || yb) {
      s.push('translate(' + xb + pxComma + yb + pxParen)
    }
  }

  function rotate(a: number, b: number, s: (string | null)[], q: { i: number, x: (t: number) => number }[]): void {
    if (a !== b) {
      if (a - b > 180) b += 360; else if (b - a > 180) a += 360 // shortest path
      q.push({ i: s.push(pop(s) + 'rotate(', null, degParen) - 2, x: number(a, b) })
    } else if (b) {
      s.push(pop(s) + 'rotate(' + b + degParen)
    }
  }

  function skewX(a: number, b: number, s: (string | null)[], q: { i: number, x: (t: number) => number }[]): void {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + 'skewX(', null, degParen) - 2, x: number(a, b) })
    } else if (b) {
      s.push(pop(s) + 'skewX(' + b + degParen)
    }
  }

  function scale(xa: number, ya: number, xb: number, yb: number, s: (string | null)[], q: { i: number, x: (t: number) => number }[]): void {
    if (xa !== xb || ya !== yb) {
      const i = s.push(pop(s) + 'scale(', null, ',', null, ')')
      q.push({ i: i - 4, x: number(xa, xb) }, { i: i - 2, x: number(ya, yb) })
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + 'scale(' + xb + ',' + yb + ')')
    }
  }

  return function (a: any, b: any): (t: number) => string {
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

export const interpolateTransformCss: (a: any, b: any) => (t: number) => string = interpolateTransform(parseCss, 'px, ', 'px)', 'deg)')
export const interpolateTransformSvg: (a: any, b: any) => (t: number) => string = interpolateTransform(parseSvg, ', ', ')', ')')
