import { describe, it, expect } from 'bun:test'
import { path, pathRound } from '../src/index'

function precision(str: string, prec: number): string {
  return str.replace(/\d+\.\d+/g, s => String(+parseFloat(s).toFixed(prec)))
}

describe('pathRound', () => {
  it('pathRound() defaults to three digits of precision', () => {
    const p = pathRound()
    p.moveTo(Math.PI, Math.E)
    expect(p + '').toBe('M3.142,2.718')
  })

  it('pathRound(null) is equivalent to pathRound(0)', () => {
    const p = pathRound(null as unknown as number)
    p.moveTo(Math.PI, Math.E)
    expect(p + '').toBe('M3,3')
  })

  it('pathRound(digits) validates the specified digits', () => {
    expect(() => pathRound(NaN)).toThrow(/invalid digits/)
    expect(() => pathRound(-1)).toThrow(/invalid digits/)
  })

  it('pathRound(digits) ignores digits if greater than 15', () => {
    const p = pathRound(40)
    p.moveTo(Math.PI, Math.E)
    expect(p + '').toBe('M3.141592653589793,2.718281828459045')
  })

  it('pathRound.moveTo(x, y) limits the precision', () => {
    const p = pathRound(1)
    p.moveTo(123.456, 789.012)
    expect(p + '').toBe('M123.5,789')
  })

  it('pathRound.lineTo(x, y) limits the precision', () => {
    const p = pathRound(1)
    p.moveTo(0, 0)
    p.lineTo(123.456, 789.012)
    expect(p + '').toBe('M0,0L123.5,789')
  })

  it('pathRound.arc(x, y, r, a0, a1, ccw) limits the precision', () => {
    const p0 = path(), p = pathRound(1)
    p0.arc(10.0001, 10.0001, 123.456, 0, Math.PI + 0.0001)
    p.arc(10.0001, 10.0001, 123.456, 0, Math.PI + 0.0001)
    expect(p + '').toBe(precision(p0 + '', 1))
    p0.arc(10.0001, 10.0001, 123.456, 0, Math.PI - 0.0001)
    p.arc(10.0001, 10.0001, 123.456, 0, Math.PI - 0.0001)
    expect(p + '').toBe(precision(p0 + '', 1))
    p0.arc(10.0001, 10.0001, 123.456, 0, Math.PI / 2, true)
    p.arc(10.0001, 10.0001, 123.456, 0, Math.PI / 2, true)
    expect(p + '').toBe(precision(p0 + '', 1))
  })

  it('pathRound.arcTo(x1, y1, x2, y2, r) limits the precision', () => {
    const p0 = path(), p = pathRound(1)
    p0.arcTo(10.0001, 10.0001, 123.456, 456.789, 12345.6789)
    p.arcTo(10.0001, 10.0001, 123.456, 456.789, 12345.6789)
    expect(p + '').toBe(precision(p0 + '', 1))
  })

  it('pathRound.quadraticCurveTo(x1, y1, x, y) limits the precision', () => {
    const p0 = path(), p = pathRound(1)
    p0.quadraticCurveTo(10.0001, 10.0001, 123.456, 456.789)
    p.quadraticCurveTo(10.0001, 10.0001, 123.456, 456.789)
    expect(p + '').toBe(precision(p0 + '', 1))
  })

  it('pathRound.bezierCurveTo(x1, y1, x2, y2, x, y) limits the precision', () => {
    const p0 = path(), p = pathRound(1)
    p0.bezierCurveTo(10.0001, 10.0001, 123.456, 456.789, 0.007, 0.006)
    p.bezierCurveTo(10.0001, 10.0001, 123.456, 456.789, 0.007, 0.006)
    expect(p + '').toBe(precision(p0 + '', 1))
  })

  it('pathRound.rect(x, y, w, h) limits the precision', () => {
    const p0 = path(), p = pathRound(1)
    p0.rect(10.0001, 10.0001, 123.456, 456.789)
    p.rect(10.0001, 10.0001, 123.456, 456.789)
    expect(p + '').toBe(precision(p0 + '', 1))
  })
})
