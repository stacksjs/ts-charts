import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomInt {
  (min: number, max?: number): () => number
  source(source: RandomSource): RandomInt
}

function sourceRandomInt(source: RandomSource): RandomInt {
  function randomInt(min: number, max?: number): () => number {
    let lo: number
    let hi: number
    if (max === undefined) {
      hi = Math.floor(min)
      lo = 0
    } else {
      lo = Math.floor(min)
      hi = Math.floor(max) - lo
    }
    return function (): number {
      return Math.floor(source() * hi + lo)
    }
  }

  randomInt.source = sourceRandomInt

  return randomInt
}

const randomInt: RandomInt = sourceRandomInt(defaultSource)
export default randomInt
