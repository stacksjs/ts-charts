import { describe, expect, it } from 'bun:test'
import { color } from '../src/index.ts'
import { assertHslEqual, assertRgbApproxEqual, assertRgbEqual } from './asserts.ts'
import type { Hsl, Rgb } from '../src/index.ts'

describe('color', () => {
  it('color(format) parses CSS color names (e.g., "rebeccapurple")', () => {
    assertRgbApproxEqual(color('moccasin') as Rgb, 255, 228, 181, 1)
    assertRgbApproxEqual(color('aliceblue') as Rgb, 240, 248, 255, 1)
    assertRgbApproxEqual(color('yellow') as Rgb, 255, 255, 0, 1)
    assertRgbApproxEqual(color('moccasin') as Rgb, 255, 228, 181, 1)
    assertRgbApproxEqual(color('aliceblue') as Rgb, 240, 248, 255, 1)
    assertRgbApproxEqual(color('yellow') as Rgb, 255, 255, 0, 1)
    assertRgbApproxEqual(color('rebeccapurple') as Rgb, 102, 51, 153, 1)
    assertRgbApproxEqual(color('transparent') as Rgb, NaN, NaN, NaN, 0)
  })

  it('color(format) parses 6-digit hexadecimal (e.g., "#abcdef")', () => {
    assertRgbApproxEqual(color('#abcdef') as Rgb, 171, 205, 239, 1)
  })

  it('color(format) parses 3-digit hexadecimal (e.g., "#abc")', () => {
    assertRgbApproxEqual(color('#abc') as Rgb, 170, 187, 204, 1)
  })

  it('color(format) does not parse 7-digit hexadecimal (e.g., "#abcdef3")', () => {
    expect(color('#abcdef3')).toBe(null)
  })

  it('color(format) parses 8-digit hexadecimal (e.g., "#abcdef33")', () => {
    assertRgbApproxEqual(color('#abcdef33') as Rgb, 171, 205, 239, 0.2)
  })

  it('color(format) parses 4-digit hexadecimal (e.g., "#abc3")', () => {
    assertRgbApproxEqual(color('#abc3') as Rgb, 170, 187, 204, 0.2)
  })

  it('color(format) parses RGB integer format (e.g., "rgb(12,34,56)")', () => {
    assertRgbApproxEqual(color('rgb(12,34,56)') as Rgb, 12, 34, 56, 1)
  })

  it('color(format) parses RGBA integer format (e.g., "rgba(12,34,56,0.4)")', () => {
    assertRgbApproxEqual(color('rgba(12,34,56,0.4)') as Rgb, 12, 34, 56, 0.4)
  })

  it('color(format) parses RGB percentage format (e.g., "rgb(12%,34%,56%)")', () => {
    assertRgbApproxEqual(color('rgb(12%,34%,56%)') as Rgb, 31, 87, 143, 1)
    assertRgbEqual(color('rgb(100%,100%,100%)') as Rgb, 255, 255, 255, 1)
  })

  it('color(format) parses RGBA percentage format (e.g., "rgba(12%,34%,56%,0.4)")', () => {
    assertRgbApproxEqual(color('rgba(12%,34%,56%,0.4)') as Rgb, 31, 87, 143, 0.4)
    assertRgbEqual(color('rgba(100%,100%,100%,0.4)') as Rgb, 255, 255, 255, 0.4)
  })

  it('color(format) parses HSL format (e.g., "hsl(60,100%,20%)")', () => {
    assertHslEqual(color('hsl(60,100%,20%)') as Hsl, 60, 1, 0.2, 1)
  })

  it('color(format) parses HSLA format (e.g., "hsla(60,100%,20%,0.4)")', () => {
    assertHslEqual(color('hsla(60,100%,20%,0.4)') as Hsl, 60, 1, 0.2, 0.4)
  })

  it('color(format) ignores leading and trailing whitespace', () => {
    assertRgbApproxEqual(color(' aliceblue\t\n') as Rgb, 240, 248, 255, 1)
    assertRgbApproxEqual(color(' #abc\t\n') as Rgb, 170, 187, 204, 1)
    assertRgbApproxEqual(color(' #aabbcc\t\n') as Rgb, 170, 187, 204, 1)
    assertRgbApproxEqual(color(' rgb(120,30,50)\t\n') as Rgb, 120, 30, 50, 1)
    assertHslEqual(color(' hsl(120,30%,50%)\t\n') as Hsl, 120, 0.3, 0.5, 1)
  })

  it('color(format) ignores whitespace between numbers', () => {
    assertRgbApproxEqual(color(' rgb( 120 , 30 , 50 ) ') as Rgb, 120, 30, 50, 1)
    assertHslEqual(color(' hsl( 120 , 30% , 50% ) ') as Hsl, 120, 0.3, 0.5, 1)
    assertRgbApproxEqual(color(' rgba( 12 , 34 , 56 , 0.4 ) ') as Rgb, 12, 34, 56, 0.4)
    assertRgbApproxEqual(color(' rgba( 12% , 34% , 56% , 0.4 ) ') as Rgb, 31, 87, 143, 0.4)
    assertHslEqual(color(' hsla( 60 , 100% , 20% , 0.4 ) ') as Hsl, 60, 1, 0.2, 0.4)
  })

  it('color(format) allows number signs', () => {
    assertRgbApproxEqual(color('rgb(+120,+30,+50)') as Rgb, 120, 30, 50, 1)
    assertHslEqual(color('hsl(+120,+30%,+50%)') as Hsl, 120, 0.3, 0.5, 1)
    assertRgbApproxEqual(color('rgb(-120,-30,-50)') as Rgb, -120, -30, -50, 1)
    assertHslEqual(color('hsl(-120,-30%,-50%)') as Hsl, NaN, NaN, -0.5, 1)
    assertRgbApproxEqual(color('rgba(12,34,56,+0.4)') as Rgb, 12, 34, 56, 0.4)
    assertRgbApproxEqual(color('rgba(12,34,56,-0.4)') as Rgb, NaN, NaN, NaN, -0.4)
    assertRgbApproxEqual(color('rgba(12%,34%,56%,+0.4)') as Rgb, 31, 87, 143, 0.4)
    assertRgbApproxEqual(color('rgba(12%,34%,56%,-0.4)') as Rgb, NaN, NaN, NaN, -0.4)
    assertHslEqual(color('hsla(60,100%,20%,+0.4)') as Hsl, 60, 1, 0.2, 0.4)
    assertHslEqual(color('hsla(60,100%,20%,-0.4)') as Hsl, NaN, NaN, NaN, -0.4)
  })

  it('color(format) allows decimals for non-integer values', () => {
    assertRgbApproxEqual(color('rgb(20.0%,30.4%,51.2%)') as Rgb, 51, 78, 131, 1)
    assertHslEqual(color('hsl(20.0,30.4%,51.2%)') as Hsl, 20, 0.304, 0.512, 1)
  })

  it('color(format) allows leading decimal for hue, opacity and percentages', () => {
    assertHslEqual(color('hsl(.9,.3%,.5%)') as Hsl, 0.9, 0.003, 0.005, 1)
    assertHslEqual(color('hsla(.9,.3%,.5%,.5)') as Hsl, 0.9, 0.003, 0.005, 0.5)
    assertRgbApproxEqual(color('rgb(.1%,.2%,.3%)') as Rgb, 0, 1, 1, 1)
    assertRgbApproxEqual(color('rgba(120,30,50,.5)') as Rgb, 120, 30, 50, 0.5)
  })

  it('color(format) allows exponential format for hue, opacity and percentages', () => {
    assertHslEqual(color('hsl(1e1,2e1%,3e1%)') as Hsl, 10, 0.2, 0.3, 1)
    assertHslEqual(color('hsla(9e-1,3e-1%,5e-1%,5e-1)') as Hsl, 0.9, 0.003, 0.005, 0.5)
    assertRgbApproxEqual(color('rgb(1e-1%,2e-1%,3e-1%)') as Rgb, 0, 1, 1, 1)
    assertRgbApproxEqual(color('rgba(120,30,50,1e-1)') as Rgb, 120, 30, 50, 0.1)
  })

  it('color(format) does not allow decimals for integer values', () => {
    expect(color('rgb(120.5,30,50)')).toBe(null)
  })

  it('color(format) does not allow empty decimals', () => {
    expect(color('rgb(120.,30,50)')).toBe(null)
    expect(color('rgb(120.%,30%,50%)')).toBe(null)
    expect(color('rgba(120,30,50,1.)')).toBe(null)
    expect(color('rgba(12%,30%,50%,1.)')).toBe(null)
    expect(color('hsla(60,100%,20%,1.)')).toBe(null)
  })

  it('color(format) does not allow made-up names', () => {
    expect(color('bostock')).toBe(null)
  })

  it('color(format) allows achromatic colors', () => {
    assertRgbApproxEqual(color('rgba(0,0,0,0)') as Rgb, NaN, NaN, NaN, 0)
    assertRgbApproxEqual(color('#0000') as Rgb, NaN, NaN, NaN, 0)
    assertRgbApproxEqual(color('#00000000') as Rgb, NaN, NaN, NaN, 0)
  })

  it('color(format) does not allow whitespace before open paren or percent sign', () => {
    expect(color('rgb (120,30,50)')).toBe(null)
    expect(color('rgb (12%,30%,50%)')).toBe(null)
    expect(color('hsl (120,30%,50%)')).toBe(null)
    expect(color('hsl(120,30 %,50%)')).toBe(null)
    expect(color('rgba (120,30,50,1)')).toBe(null)
    expect(color('rgba (12%,30%,50%,1)')).toBe(null)
    expect(color('hsla (120,30%,50%,1)')).toBe(null)
  })

  it('color(format) is case-insensitive', () => {
    assertRgbApproxEqual(color('aLiCeBlUE') as Rgb, 240, 248, 255, 1)
    assertRgbApproxEqual(color('transPARENT') as Rgb, NaN, NaN, NaN, 0)
    assertRgbApproxEqual(color(' #aBc\t\n') as Rgb, 170, 187, 204, 1)
    assertRgbApproxEqual(color(' #aaBBCC\t\n') as Rgb, 170, 187, 204, 1)
    assertRgbApproxEqual(color(' rGB(120,30,50)\t\n') as Rgb, 120, 30, 50, 1)
    assertHslEqual(color(' HSl(120,30%,50%)\t\n') as Hsl, 120, 0.3, 0.5, 1)
  })

  it('color(format) returns undefined RGB channel values for unknown formats', () => {
    expect(color('invalid')).toBe(null)
    expect(color('hasOwnProperty')).toBe(null)
    expect(color('__proto__')).toBe(null)
    expect(color('#ab')).toBe(null)
  })

  it('color(format).hex() returns a hexadecimal string', () => {
    expect(color('rgba(12%,34%,56%,0.4)')!.hex()).toBe('#1f578f')
  })
})
