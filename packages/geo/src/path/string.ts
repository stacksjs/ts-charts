type AppendFn = (this: PathString, strings: TemplateStringsArray, ...values: number[]) => void

let cacheDigits: number, cacheAppend: AppendFn, cacheRadius: number, cacheCircle: string

export default class PathString {
  _append: AppendFn
  _radius: number
  _: string
  _line: number = NaN
  _point: number = NaN

  constructor(digits: number | null) {
    this._append = digits == null ? append : appendRound(digits)
    this._radius = 4.5
    this._ = ''
  }

  pointRadius(_: number): this {
    this._radius = +_
    return this
  }

  polygonStart(): void {
    this._line = 0
  }

  polygonEnd(): void {
    this._line = NaN
  }

  lineStart(): void {
    this._point = 0
  }

  lineEnd(): void {
    if (this._line === 0) this._ += 'Z'
    this._point = NaN
  }

  point(x: number, y: number): void {
    switch (this._point) {
      case 0: {
        this._append`M${x},${y}`
        this._point = 1
        break
      }
      case 1: {
        this._append`L${x},${y}`
        break
      }
      default: {
        this._append`M${x},${y}`
        if (this._radius !== cacheRadius || this._append !== cacheAppend) {
          const r = this._radius
          const s = this._
          this._ = ''
          this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`
          cacheRadius = r
          cacheAppend = this._append
          cacheCircle = this._
          this._ = s
        }
        this._ += cacheCircle
        break
      }
    }
  }

  result(): string | null {
    const result = this._
    this._ = ''
    return result.length ? result : null
  }
}

function append(this: PathString, strings: TemplateStringsArray, ...values: number[]): void {
  let i = 0
  this._ += strings[0]
  for (const j = strings.length - 1; i < j; ++i) {
    this._ += values[i] + strings[i + 1]
  }
}

function appendRound(digits: number): AppendFn {
  const d = Math.floor(digits)
  if (!(d >= 0)) throw new RangeError(`invalid digits: ${digits}`)
  if (d > 15) return append
  if (d !== cacheDigits) {
    const k = 10 ** d
    cacheDigits = d
    cacheAppend = function (this: PathString, strings: TemplateStringsArray, ...values: number[]): void {
      let i = 0
      this._ += strings[0]
      for (const j = strings.length - 1; i < j; ++i) {
        this._ += Math.round(values[i] * k) / k + strings[i + 1]
      }
    }
  }
  return cacheAppend
}
