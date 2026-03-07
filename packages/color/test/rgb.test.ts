import { describe, expect, it } from 'bun:test'
import { Color, Rgb, color, hsl, rgb } from '../src/index.ts'
import { assertRgbApproxEqual, assertRgbEqual } from './asserts.ts'

describe('rgb', () => {
  it('rgb(...) returns an instance of rgb and color', () => {
    const c = rgb(70, 130, 180)
    expect(c instanceof Rgb).toBe(true)
    expect(c instanceof Color).toBe(true)
  })

  it('rgb(...) exposes r, g and b channel values and opacity', () => {
    assertRgbApproxEqual(rgb('#abc'), 170, 187, 204, 1)
    assertRgbApproxEqual(rgb('rgba(170, 187, 204, 0.4)'), 170, 187, 204, 0.4)
  })

  it('rgb.toString() formats as rgb(...) or rgba(...)', () => {
    expect(rgb('#abcdef') + '').toBe('rgb(171, 205, 239)')
    expect(rgb('moccasin') + '').toBe('rgb(255, 228, 181)')
    expect(rgb('hsl(60, 100%, 20%)') + '').toBe('rgb(102, 102, 0)')
    expect(rgb('rgb(12, 34, 56)') + '').toBe('rgb(12, 34, 56)')
    expect(rgb(rgb(12, 34, 56)) + '').toBe('rgb(12, 34, 56)')
    expect(rgb(hsl(60, 1, 0.2)) + '').toBe('rgb(102, 102, 0)')
    expect(rgb('rgba(12, 34, 56, 0.4)') + '').toBe('rgba(12, 34, 56, 0.4)')
    expect(rgb('rgba(12%, 34%, 56%, 0.4)') + '').toBe('rgba(31, 87, 143, 0.4)')
    expect(rgb('hsla(60, 100%, 20%, 0.4)') + '').toBe('rgba(102, 102, 0, 0.4)')
  })

  it('rgb.formatRgb() formats as rgb(...) or rgba(...)', () => {
    expect(rgb('#abcdef').formatRgb()).toBe('rgb(171, 205, 239)')
    expect(rgb('hsl(60, 100%, 20%)').formatRgb()).toBe('rgb(102, 102, 0)')
    expect(rgb('rgba(12%, 34%, 56%, 0.4)').formatRgb()).toBe('rgba(31, 87, 143, 0.4)')
    expect(rgb('hsla(60, 100%, 20%, 0.4)').formatRgb()).toBe('rgba(102, 102, 0, 0.4)')
  })

  it('rgb.formatHsl() formats as hsl(...) or hsla(...)', () => {
    expect(rgb('#abcdef').formatHsl()).toBe('hsl(210, 68%, 80.3921568627451%)')
    expect(rgb('hsl(60, 100%, 20%)').formatHsl()).toBe('hsl(60, 100%, 20%)')
    expect(rgb('rgba(12%, 34%, 56%, 0.4)').formatHsl()).toBe('hsla(210, 64.70588235294117%, 34%, 0.4)')
    expect(rgb('hsla(60, 100%, 20%, 0.4)').formatHsl()).toBe('hsla(60, 100%, 20%, 0.4)')
  })

  it('rgb.formatHex() formats as #rrggbb', () => {
    expect(rgb('#abcdef').formatHex()).toBe('#abcdef')
    expect(rgb('hsl(60, 100%, 20%)').formatHex()).toBe('#666600')
    expect(rgb('rgba(12%, 34%, 56%, 0.4)').formatHex()).toBe('#1f578f')
    expect(rgb('hsla(60, 100%, 20%, 0.4)').formatHex()).toBe('#666600')
  })

  it('rgb.formatHex8() formats as #rrggbbaa', () => {
    expect(rgb('#abcdef').formatHex8()).toBe('#abcdefff')
    expect(rgb('hsl(60, 100%, 20%)').formatHex8()).toBe('#666600ff')
    expect(rgb('rgba(12%, 34%, 56%, 0.4)').formatHex8()).toBe('#1f578f66')
    expect(rgb('hsla(60, 100%, 20%, 0.4)').formatHex8()).toBe('#66660066')
  })

  it('rgb.hex() is an alias for rgb.formatHex()', () => {
    expect(Color.prototype.hex).toBe(Color.prototype.formatHex)
    expect(Rgb.prototype.hex).toBe(Rgb.prototype.formatHex)
  })

  it('rgb.toString() reflects r, g and b channel values and opacity', () => {
    const c = rgb('#abc')
    ++c.r; ++c.g; ++c.b; c.opacity = 0.5
    expect(c + '').toBe('rgba(171, 188, 205, 0.5)')
  })

  it('rgb.toString() treats undefined channel values as 0', () => {
    expect(rgb('invalid') + '').toBe('rgb(0, 0, 0)')
    expect(rgb(NaN, 12, 34) + '').toBe('rgb(0, 12, 34)')
  })

  it('rgb.toString() treats undefined opacity as 1', () => {
    const c = rgb('#abc')
    ++c.r; ++c.g; ++c.b; c.opacity = NaN
    expect(c + '').toBe('rgb(171, 188, 205)')
  })

  it('rgb.toString() clamps r, g, b and opacity channel values', () => {
    expect(rgb(-1, 2, 3) + '').toBe('rgb(0, 2, 3)')
    expect(rgb(2, -1, 3) + '').toBe('rgb(2, 0, 3)')
    expect(rgb(2, 3, -1) + '').toBe('rgb(2, 3, 0)')
    expect(rgb(2, 3, -1, -0.2) + '').toBe('rgba(2, 3, 0, 0)')
    expect(rgb(2, 3, -1, 1.2) + '').toBe('rgb(2, 3, 0)')
  })

  it('rgb.toString() rounds r, g and b channel values', () => {
    expect(rgb(0.5, 2.0, 3.0) + '').toBe('rgb(1, 2, 3)')
    expect(rgb(2.0, 0.5, 3.0) + '').toBe('rgb(2, 1, 3)')
    expect(rgb(2.0, 3.0, 0.5) + '').toBe('rgb(2, 3, 1)')
  })

  it('rgb(r, g, b) does not round channel values', () => {
    assertRgbEqual(rgb(1.2, 2.6, 42.9), 1.2, 2.6, 42.9, 1)
  })

  it('rgb(r, g, b) does not clamp channel values', () => {
    assertRgbApproxEqual(rgb(-10, -20, -30), -10, -20, -30, 1)
    assertRgbApproxEqual(rgb(300, 400, 500), 300, 400, 500, 1)
  })

  it('rgb(r, g, b).clamp() rounds and clamps channel values', () => {
    assertRgbApproxEqual(rgb(-10, -20, -30).clamp(), 0, 0, 0, 1)
    assertRgbApproxEqual(rgb(10.5, 20.5, 30.5).clamp(), 11, 21, 31, 1)
    assertRgbApproxEqual(rgb(300, 400, 500).clamp(), 255, 255, 255, 1)
    expect(rgb(10.5, 20.5, 30.5, -1).clamp().opacity).toBe(0)
    expect(rgb(10.5, 20.5, 30.5, 0.5).clamp().opacity).toBe(0.5)
    expect(rgb(10.5, 20.5, 30.5, 2).clamp().opacity).toBe(1)
    expect(rgb(10.5, 20.5, 30.5, NaN).clamp().opacity).toBe(1)
  })

  it('rgb(r, g, b, opacity) does not clamp opacity', () => {
    assertRgbApproxEqual(rgb(-10, -20, -30, -0.2), -10, -20, -30, -0.2)
    assertRgbApproxEqual(rgb(300, 400, 500, 1.2), 300, 400, 500, 1.2)
  })

  it('rgb(r, g, b) coerces channel values to numbers', () => {
    assertRgbApproxEqual(rgb('12' as any, '34' as any, '56' as any), 12, 34, 56, 1)
    assertRgbApproxEqual(rgb(null as any, null as any, null as any), 0, 0, 0, 1)
  })

  it('rgb(r, g, b, opacity) coerces opacity to number', () => {
    assertRgbEqual(rgb(-10, -20, -30, '-0.2' as any), -10, -20, -30, -0.2)
    assertRgbEqual(rgb(300, 400, 500, '1.2' as any), 300, 400, 500, 1.2)
  })

  it('rgb(r, g, b) allows undefined channel values', () => {
    assertRgbApproxEqual(rgb(undefined as any, NaN, 'foo' as any), NaN, NaN, NaN, 1)
    assertRgbApproxEqual(rgb(undefined as any, 42, 56), NaN, 42, 56, 1)
    assertRgbApproxEqual(rgb(42, undefined as any, 56), 42, NaN, 56, 1)
    assertRgbApproxEqual(rgb(42, 56, undefined as any), 42, 56, NaN, 1)
  })

  it('rgb(r, g, b, opacity) converts undefined opacity to 1', () => {
    assertRgbApproxEqual(rgb(10, 20, 30, null as any), 10, 20, 30, 1)
    assertRgbApproxEqual(rgb(10, 20, 30, undefined), 10, 20, 30, 1)
  })

  it('rgb(format) parses the specified format and converts to RGB', () => {
    assertRgbApproxEqual(rgb('#abcdef'), 171, 205, 239, 1)
    assertRgbApproxEqual(rgb('#abc'), 170, 187, 204, 1)
    assertRgbApproxEqual(rgb('rgb(12, 34, 56)'), 12, 34, 56, 1)
    assertRgbApproxEqual(rgb('rgb(12%, 34%, 56%)'), 31, 87, 143, 1)
    assertRgbApproxEqual(rgb('hsl(60,100%,20%)'), 102, 102, 0, 1)
    assertRgbApproxEqual(rgb('aliceblue'), 240, 248, 255, 1)
    assertRgbApproxEqual(rgb('hsla(60,100%,20%,0.4)'), 102, 102, 0, 0.4)
  })

  it('rgb(format) ignores all channels if the alpha is <= 0', () => {
    assertRgbApproxEqual(rgb('rgba(12,34,45,0)'), NaN, NaN, NaN, 0)
    assertRgbApproxEqual(rgb('rgba(12,34,45,-0.1)'), NaN, NaN, NaN, -0.1)
  })

  it('rgb(format) returns undefined channel values for unknown formats', () => {
    assertRgbApproxEqual(rgb('invalid'), NaN, NaN, NaN, NaN)
  })

  it('rgb(rgb) copies an RGB color', () => {
    const c1 = rgb('rgba(70, 130, 180, 0.4)')
    const c2 = rgb(c1)
    assertRgbApproxEqual(c1, 70, 130, 180, 0.4)
    c1.r = c1.g = c1.b = c1.opacity = 0
    assertRgbApproxEqual(c1, 0, 0, 0, 0)
    assertRgbApproxEqual(c2, 70, 130, 180, 0.4)
  })

  it('rgb(hsl) converts from HSL', () => {
    assertRgbApproxEqual(rgb(hsl(0, 1, 0.5)), 255, 0, 0, 1)
    assertRgbApproxEqual(rgb(hsl(0, 1, 0.5, 0.4)), 255, 0, 0, 0.4)
  })

  it('rgb(color) converts from another colorspace via rgb()', () => {
    class TestColor extends Color {
      override rgb() { return rgb(12, 34, 56, 0.4) }
      override toString(): string { throw new Error('should use rgb, not toString') }
    }
    assertRgbApproxEqual(rgb(new TestColor()), 12, 34, 56, 0.4)
  })

  it('rgb.displayable() returns true if the color is within the RGB gamut and opacity is in [0,1]', () => {
    expect(rgb('white').displayable()).toBe(true)
    expect(rgb('red').displayable()).toBe(true)
    expect(rgb('black').displayable()).toBe(true)
    expect(rgb('invalid').displayable()).toBe(false)
    expect(rgb(-1, 0, 0).displayable()).toBe(false)
    expect(rgb(0, -1, 0).displayable()).toBe(false)
    expect(rgb(0, 0, -1).displayable()).toBe(false)
    expect(rgb(256, 0, 0).displayable()).toBe(false)
    expect(rgb(0, 256, 0).displayable()).toBe(false)
    expect(rgb(0, 0, 256).displayable()).toBe(false)
    expect(rgb(0, 0, 255, 0).displayable()).toBe(true)
    expect(rgb(0, 0, 255, 1.2).displayable()).toBe(false)
    expect(rgb(0, 0, 255, -0.2).displayable()).toBe(false)
  })

  it('rgb.brighter(k) returns a brighter color if k > 0', () => {
    const c = rgb('rgba(165, 42, 42, 0.4)')
    assertRgbApproxEqual(c.brighter(0.5), 197, 50, 50, 0.4)
    assertRgbApproxEqual(c.brighter(1), 236, 60, 60, 0.4)
    assertRgbApproxEqual(c.brighter(2), 337, 86, 86, 0.4)
  })

  it('rgb.brighter(k) returns a copy', () => {
    const c1 = rgb('rgba(70, 130, 180, 0.4)')
    const c2 = c1.brighter(1)
    assertRgbApproxEqual(c1, 70, 130, 180, 0.4)
    assertRgbApproxEqual(c2, 100, 186, 257, 0.4)
  })

  it('rgb.brighter() is equivalent to rgb.brighter(1)', () => {
    const c1 = rgb('rgba(70, 130, 180, 0.4)')
    const c2 = c1.brighter()
    const c3 = c1.brighter(1)
    assertRgbApproxEqual(c2, c3.r, c3.g, c3.b, 0.4)
  })

  it('rgb.brighter(k) is equivalent to rgb.darker(-k)', () => {
    const c1 = rgb('rgba(70, 130, 180, 0.4)')
    const c2 = c1.brighter(1.5)
    const c3 = c1.darker(-1.5)
    assertRgbApproxEqual(c2, c3.r, c3.g, c3.b, 0.4)
  })

  it('rgb("black").brighter() still returns black', () => {
    const c1 = rgb('black')
    const c2 = c1.brighter(1)
    assertRgbApproxEqual(c1, 0, 0, 0, 1)
    assertRgbApproxEqual(c2, 0, 0, 0, 1)
  })

  it('rgb.darker(k) returns a darker color if k > 0', () => {
    const c = rgb('rgba(165, 42, 42, 0.4)')
    assertRgbApproxEqual(c.darker(0.5), 138, 35, 35, 0.4)
    assertRgbApproxEqual(c.darker(1), 115, 29, 29, 0.4)
    assertRgbApproxEqual(c.darker(2), 81, 21, 21, 0.4)
  })

  it('rgb.darker(k) returns a copy', () => {
    const c1 = rgb('rgba(70, 130, 180, 0.4)')
    const c2 = c1.darker(1)
    assertRgbApproxEqual(c1, 70, 130, 180, 0.4)
    assertRgbApproxEqual(c2, 49, 91, 126, 0.4)
  })

  it('rgb.darker() is equivalent to rgb.darker(1)', () => {
    const c1 = rgb('rgba(70, 130, 180, 0.4)')
    const c2 = c1.darker()
    const c3 = c1.darker(1)
    assertRgbApproxEqual(c2, c3.r, c3.g, c3.b, 0.4)
  })

  it('rgb.darker(k) is equivalent to rgb.brighter(-k)', () => {
    const c1 = rgb('rgba(70, 130, 180, 0.4)')
    const c2 = c1.darker(1.5)
    const c3 = c1.brighter(-1.5)
    assertRgbApproxEqual(c2, c3.r, c3.g, c3.b, 0.4)
  })

  it('rgb.rgb() returns this', () => {
    const c = rgb(70, 130, 180)
    expect(c.rgb()).toBe(c)
  })

  it('rgb.copy(...) returns a new rgb with the specified channel values', () => {
    const c = rgb(70, 130, 180)
    expect(c.copy() instanceof Rgb).toBe(true)
    expect(c.copy() + '').toBe('rgb(70, 130, 180)')
    expect(c.copy({ opacity: 0.2 }) + '').toBe('rgba(70, 130, 180, 0.2)')
    expect(c.copy({ r: 20 }) + '').toBe('rgb(20, 130, 180)')
    expect(c.copy({ r: 20, g: 40 }) + '').toBe('rgb(20, 40, 180)')
  })
})
