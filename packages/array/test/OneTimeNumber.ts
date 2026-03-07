export class OneTimeNumber {
  value: number

  constructor(value: number) {
    this.value = value
  }

  valueOf(): number {
    const v = this.value
    this.value = NaN
    return v
  }
}
