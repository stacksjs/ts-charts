import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomUniform {
  (min?: number, max?: number): () => number
  source(source: RandomSource): RandomUniform
}

function sourceRandomUniform(source: RandomSource): RandomUniform {
  function randomUniform(min?: number, max?: number): () => number {
    let lo = min == null ? 0 : +min
    let hi = max == null ? 1 : +max
    if (max === undefined) {
      if (min !== undefined) {
        hi = lo
        lo = 0
      }
    } else {
      hi -= lo
    }
    return function (): number {
      return source() * hi + lo
    }
  }

  randomUniform.source = sourceRandomUniform

  return randomUniform
}

const randomUniform: RandomUniform = sourceRandomUniform(defaultSource)
export default randomUniform
