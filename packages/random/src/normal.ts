import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomNormal {
  (mu?: number, sigma?: number): () => number
  source(source: RandomSource): RandomNormal
}

function sourceRandomNormal(source: RandomSource): RandomNormal {
  function randomNormal(mu?: number, sigma?: number): () => number {
    let x: number | null
    let r: number
    const m = mu == null ? 0 : +mu
    const s = sigma == null ? 1 : +sigma
    return function (): number {
      let y: number

      // If available, use the second previously-generated uniform random.
      if (x != null) {
        y = x
        x = null
      }

      // Otherwise, generate a new x and y.
      else {
        do {
          x = source() * 2 - 1
          y = source() * 2 - 1
          r = x * x + y * y
        } while (!r || r > 1)
      }

      return m + s * y * Math.sqrt(-2 * Math.log(r) / r)
    }
  }

  randomNormal.source = sourceRandomNormal

  return randomNormal
}

const randomNormal: RandomNormal = sourceRandomNormal(defaultSource)
export default randomNormal
