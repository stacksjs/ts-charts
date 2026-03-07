import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomLogistic {
  (a?: number, b?: number): () => number
  source(source: RandomSource): RandomLogistic
}

function sourceRandomLogistic(source: RandomSource): RandomLogistic {
  function randomLogistic(a?: number, b?: number): () => number {
    const loc = a == null ? 0 : +a
    const scale = b == null ? 1 : +b
    return function (): number {
      const u = source()
      return loc + scale * Math.log(u / (1 - u))
    }
  }

  randomLogistic.source = sourceRandomLogistic

  return randomLogistic
}

const randomLogistic: RandomLogistic = sourceRandomLogistic(defaultSource)
export default randomLogistic
