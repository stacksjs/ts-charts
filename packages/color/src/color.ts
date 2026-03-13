export const darker: number = 0.7
export const brighter: number = 1 / darker

const reI = '\\s*([+-]?\\d+)\\s*'
const reN = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*'
const reP = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*'
const reHex = /^#([0-9a-f]{3,8})$/
const reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`)
const reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`)
const reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`)
const reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`)
const reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`)
const reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`)

const named: Record<string, number> = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32,
}

function clampa(opacity: number): number {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity))
}

function clampi(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value) || 0))
}

function hex(value: number): string {
  value = clampi(value)
  return (value < 16 ? '0' : '') + value.toString(16)
}

function clamph(value: number): number {
  value = (value || 0) % 360
  return value < 0 ? value + 360 : value
}

function clampt(value: number): number {
  return Math.max(0, Math.min(1, value || 0))
}

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h: number, m1: number, m2: number): number {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
    : h < 180 ? m2
    : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
    : m1) * 255
}

export class Color {
  opacity!: number

  copy(channels?: Record<string, number>): this {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const c = Object.assign(Object.create(Object.getPrototypeOf(this)), this, channels)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return c
  }

  displayable(): boolean {
    return this.rgb().displayable()
  }

  formatHex(): string {
    return this.rgb().formatHex()
  }

  formatHex8(): string {
    return this.rgb().formatHex8()
  }

  formatHsl(): string {
    return hslConvert(this).formatHsl()
  }

  formatRgb(): string {
    return this.rgb().formatRgb()
  }

  toString(): string {
    return this.rgb().formatRgb()
  }

  rgb(): Rgb {
    return this.rgb()
  }

  hex(): string {
    return this.formatHex()
  }
}

Color.prototype.hex = Color.prototype.formatHex

export class Rgb extends Color {
  r: number
  g: number
  b: number
  declare opacity: number

  constructor(r: number, g: number, b: number, opacity: number) {
    super()
    this.r = +r
    this.g = +g
    this.b = +b
    this.opacity = +opacity
  }

  brighter(k?: number): Rgb {
    k = k == null ? brighter : Math.pow(brighter, k)
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity)
  }

  darker(k?: number): Rgb {
    k = k == null ? darker : Math.pow(darker, k)
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity)
  }

  override rgb(): Rgb {
    return this
  }

  clamp(): Rgb {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity))
  }

  override displayable(): boolean {
    return (-0.5 <= this.r && this.r < 255.5)
      && (-0.5 <= this.g && this.g < 255.5)
      && (-0.5 <= this.b && this.b < 255.5)
      && (0 <= this.opacity && this.opacity <= 1)
  }

  override formatHex(): string {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`
  }

  override hex(): string {
    return this.formatHex()
  }

  override formatHex8(): string {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`
  }

  override formatRgb(): string {
    const a = clampa(this.opacity)
    return `${a === 1 ? 'rgb(' : 'rgba('}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ')' : `, ${a})`}`
  }

  override toString(): string {
    return this.formatRgb()
  }
}

Rgb.prototype.hex = Rgb.prototype.formatHex

export class Hsl extends Color {
  h: number
  s: number
  l: number
  declare opacity: number

  constructor(h: number, s: number, l: number, opacity: number) {
    super()
    this.h = +h
    this.s = +s
    this.l = +l
    this.opacity = +opacity
  }

  brighter(k?: number): Hsl {
    k = k == null ? brighter : Math.pow(brighter, k)
    return new Hsl(this.h, this.s, this.l * k, this.opacity)
  }

  darker(k?: number): Hsl {
    k = k == null ? darker : Math.pow(darker, k)
    return new Hsl(this.h, this.s, this.l * k, this.opacity)
  }

  override rgb(): Rgb {
    const h = this.h % 360 + (this.h < 0 ? 360 : 0)
    const s = isNaN(h) || isNaN(this.s) ? 0 : this.s
    const l = this.l
    const m2 = l + (l < 0.5 ? l : 1 - l) * s
    const m1 = 2 * l - m2
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity,
    )
  }

  clamp(): Hsl {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity))
  }

  override displayable(): boolean {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
      && (0 <= this.l && this.l <= 1)
      && (0 <= this.opacity && this.opacity <= 1)
  }

  override formatHsl(): string {
    const a = clampa(this.opacity)
    return `${a === 1 ? 'hsl(' : 'hsla('}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ')' : `, ${a})`}`
  }
}

function rgbn(n: number): Rgb {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1)
}

function rgba(r: number, g: number, b: number, a: number): Rgb {
  if (a <= 0) r = g = b = NaN
  return new Rgb(r, g, b, a)
}

function hsla(h: number, s: number, l: number, a: number): Hsl {
  if (a <= 0) h = s = l = NaN
  else if (l <= 0 || l >= 1) h = s = NaN
  else if (s <= 0) h = NaN
  return new Hsl(h, s, l, a)
}

export function color(format: string): Color | null {
  let m: RegExpExecArray | null
  // eslint-disable-next-line pickier/no-unused-vars
  format = (format + '').trim().toLowerCase()

  if ((m = reHex.exec(format))) {
    const l = m[1].length
    const n = parseInt(m[1], 16)
    if (l === 6) return rgbn(n)
    if (l === 3) return new Rgb((n >> 8 & 0xf) | (n >> 4 & 0xf0), (n >> 4 & 0xf) | (n & 0xf0), ((n & 0xf) << 4) | (n & 0xf), 1)
    if (l === 8) return rgba(n >> 24 & 0xff, n >> 16 & 0xff, n >> 8 & 0xff, (n & 0xff) / 0xff)
    if (l === 4) return rgba((n >> 12 & 0xf) | (n >> 8 & 0xf0), (n >> 8 & 0xf) | (n >> 4 & 0xf0), (n >> 4 & 0xf) | (n & 0xf0), (((n & 0xf) << 4) | (n & 0xf)) / 0xff)
    return null
  }
  if ((m = reRgbInteger.exec(format))) return new Rgb(+m[1], +m[2], +m[3], 1)
  if ((m = reRgbPercent.exec(format))) return new Rgb(+m[1] * 255 / 100, +m[2] * 255 / 100, +m[3] * 255 / 100, 1)
  if ((m = reRgbaInteger.exec(format))) return rgba(+m[1], +m[2], +m[3], +m[4])
  if ((m = reRgbaPercent.exec(format))) return rgba(+m[1] * 255 / 100, +m[2] * 255 / 100, +m[3] * 255 / 100, +m[4])
  if ((m = reHslPercent.exec(format))) return hsla(+m[1], +m[2] / 100, +m[3] / 100, 1)
  if ((m = reHslaPercent.exec(format))) return hsla(+m[1], +m[2] / 100, +m[3] / 100, +m[4])
  if (Object.prototype.hasOwnProperty.call(named, format)) return rgbn(named[format])
  if (format === 'transparent') return new Rgb(NaN, NaN, NaN, 0)
  return null
}

export function rgbConvert(o: Color | string): Rgb {
  if (!(o instanceof Color)) o = color(o as string) as Color
  if (!o) return new Rgb(NaN, NaN, NaN, NaN)
  const c = o.rgb()
  return new Rgb(c.r, c.g, c.b, c.opacity)
}

export function rgb(r: number | string | Color, g?: number, b?: number, opacity?: number): Rgb {
  if (g === undefined && b === undefined) return rgbConvert(r as Color | string)
  return new Rgb(r as number, g as number, b as number, opacity == null ? 1 : opacity)
}

export function hslConvert(o: Color | string): Hsl {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity)
  if (!(o instanceof Color)) o = color(o as string) as Color
  if (!o) return new Hsl(NaN, NaN, NaN, NaN)
  if (o instanceof Hsl) return o
  const c = o.rgb()
  const r = c.r / 255
  const g = c.g / 255
  const b = c.b / 255
  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)
  let h = NaN
  let s = max - min
  const l = (max + min) / 2
  if (s) {
    if (r === max) h = (g - b) / s + (g < b ? 6 : 0)
    else if (g === max) h = (b - r) / s + 2
    else h = (r - g) / s + 4
    s /= l < 0.5 ? max + min : 2 - max - min
    h *= 60
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    s = l > 0 && l < 1 ? 0 : h
  }
  return new Hsl(h, s, l, c.opacity)
}

export function hsl(h: number | string | Color, s?: number, l?: number, opacity?: number): Hsl {
  if (s === undefined && l === undefined) return hslConvert(h as Color | string)
  return new Hsl(h as number, s as number, l as number, opacity == null ? 1 : opacity)
}
