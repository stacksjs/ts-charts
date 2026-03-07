import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomPareto {
  (alpha: number): () => number
  source(source: RandomSource): RandomPareto
}

function sourceRandomPareto(source: RandomSource): RandomPareto {
  function randomPareto(alpha: number): () => number {
    let a = +alpha
    if (a < 0) throw new RangeError('invalid alpha')
    a = 1 / -a
    return function (): number {
      return Math.pow(1 - source(), a)
    }
  }

  randomPareto.source = sourceRandomPareto

  return randomPareto
}

const randomPareto: RandomPareto = sourceRandomPareto(defaultSource)
export default randomPareto
