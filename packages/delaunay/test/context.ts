export default class Context {
  _string: string

  constructor() {
    this._string = ''
  }

  moveTo(x: number, y: number): void {
    this._string += `M${x},${y}`
  }

  lineTo(x: number, y: number): void {
    this._string += `L${x},${y}`
  }

  closePath(): void {
    this._string += 'Z'
  }

  toString(): string {
    const string = this._string
    this._string = ''
    return string
  }
}
