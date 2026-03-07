const epsilon: number = 1e-6

export default class Path {
  _x0: number | null
  _y0: number | null
  _x1: number | null
  _y1: number | null
  _: string

  constructor() {
    this._x0 = this._y0 =
    this._x1 = this._y1 = null
    this._ = ''
  }

  moveTo(x: number, y: number): void {
    this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`
  }

  closePath(): void {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0
      this._ += 'Z'
    }
  }

  lineTo(x: number, y: number): void {
    this._ += `L${this._x1 = +x},${this._y1 = +y}`
  }

  arc(x: number, y: number, r: number): void {
    x = +x, y = +y, r = +r
    const x0 = x + r
    const y0 = y
    if (r < 0) throw new Error('negative radius')
    if (this._x1 === null) this._ += `M${x0},${y0}`
    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1! - y0) > epsilon) this._ += 'L' + x0 + ',' + y0
    if (!r) return
    this._ += `A${r},${r},0,1,1,${x - r},${y}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`
  }

  rect(x: number, y: number, w: number, h: number): void {
    this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${+w}v${+h}h${-w}Z`
  }

  value(): string | null {
    return this._ || null
  }
}
