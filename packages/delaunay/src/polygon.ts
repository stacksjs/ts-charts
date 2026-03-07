export default class Polygon {
  _: [number, number][]

  constructor() {
    this._ = []
  }

  moveTo(x: number, y: number): void {
    this._.push([x, y])
  }

  closePath(): void {
    this._.push(this._[0].slice() as [number, number])
  }

  lineTo(x: number, y: number): void {
    this._.push([x, y])
  }

  value(): [number, number][] | null {
    return this._.length ? this._ : null
  }
}
