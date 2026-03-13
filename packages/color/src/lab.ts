import { Color, Rgb, rgbConvert } from './color.ts'
import { degrees, radians } from './math.ts'

// https://observablehq.com/@mbostock/lab-and-rgb
const K = 18
const Xn = 0.96422
const Yn = 1
const Zn = 0.82521
const t0 = 4 / 29
const t1 = 6 / 29
const t2 = 3 * t1 * t1
const t3 = t1 * t1 * t1

function xyz2lab(t: number): number {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0
}

function lab2xyz(t: number): number {
  return t > t1 ? t * t * t : t2 * (t - t0)
}

function lrgb2rgb(x: number): number {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)
}

function rgb2lrgb(x: number): number {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}

function labConvert(o: Color | string): Lab {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity)
  if (o instanceof Hcl) return hcl2lab(o)
  if (!(o instanceof Rgb)) o = rgbConvert(o)
  const c = o as Rgb
  const r = rgb2lrgb(c.r)
  const g = rgb2lrgb(c.g)
  const b = rgb2lrgb(c.b)
  const y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn)
  let x: number
  let z: number
  if (r === g && g === b) {
    x = z = y
  // eslint-disable-next-line pickier/no-unused-vars
  }
  else {
    x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn)
    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn)
  }
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), c.opacity)
}

export function gray(l: number, opacity?: number): Lab {
  return new Lab(l, 0, 0, opacity == null ? 1 : opacity)
}

export function lab(l: number | string | Color, a?: number, b?: number, opacity?: number): Lab {
  if (a === undefined && b === undefined) return labConvert(l as Color | string)
  return new Lab(l as number, a as number, b as number, opacity == null ? 1 : opacity)
}

export class Lab extends Color {
  l: number
  a: number
  b: number
  declare opacity: number

  constructor(l: number, a: number, b: number, opacity: number) {
    super()
    this.l = +l
    this.a = +a
    this.b = +b
    this.opacity = +opacity
  }

  brighter(k?: number): Lab {
    return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity)
  }

  darker(k?: number): Lab {
    return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity)
  }

  override rgb(): Rgb {
    const y = (this.l + 16) / 116
    const x0 = isNaN(this.a) ? y : y + this.a / 500
    const z0 = isNaN(this.b) ? y : y - this.b / 200
    const x = Xn * lab2xyz(x0)
    const yy = Yn * lab2xyz(y)
    const z = Zn * lab2xyz(z0)
    return new Rgb(
      lrgb2rgb(3.1338561 * x - 1.6168667 * yy - 0.4906146 * z),
      lrgb2rgb(-0.9787684 * x + 1.9161415 * yy + 0.0334540 * z),
      lrgb2rgb(0.0719453 * x - 0.2289914 * yy + 1.4052427 * z),
      this.opacity,
    )
  }
}

function hclConvert(o: Color | string): Hcl {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity)
  if (!(o instanceof Lab)) o = labConvert(o)
  const c = o as Lab
  if (c.a === 0 && c.b === 0) return new Hcl(NaN, 0 < c.l && c.l < 100 ? 0 : NaN, c.l, c.opacity)
  const h = Math.atan2(c.b, c.a) * degrees
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(c.a * c.a + c.b * c.b), c.l, c.opacity)
}

export function lch(l: number | string | Color, c?: number, h?: number, opacity?: number): Hcl {
  if (c === undefined && h === undefined) return hclConvert(l as Color | string)
  return new Hcl(h as number, c as number, l as number, opacity == null ? 1 : opacity)
}

export function hcl(h: number | string | Color, c?: number, l?: number, opacity?: number): Hcl {
  if (c === undefined && l === undefined) return hclConvert(h as Color | string)
  return new Hcl(h as number, c as number, l as number, opacity == null ? 1 : opacity)
}

function hcl2lab(o: Hcl): Lab {
  if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity)
  const h = o.h * radians
  return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity)
}

export class Hcl extends Color {
  h: number
  c: number
  l: number
  declare opacity: number

  constructor(h: number, c: number, l: number, opacity: number) {
    super()
    this.h = +h
    this.c = +c
    this.l = +l
    this.opacity = +opacity
  }

  brighter(k?: number): Hcl {
    return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity)
  }

  darker(k?: number): Hcl {
    return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity)
  }

  override rgb(): Rgb {
    return hcl2lab(this).rgb()
  }
}
