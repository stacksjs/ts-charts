import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomBernoulli {
  (p: number): () => number
  source(source: RandomSource): RandomBernoulli
}

function sourceRandomBernoulli(source: RandomSource): RandomBernoulli {
  function randomBernoulli(p: number): () => number {
    const prob = +p
    if (prob < 0 || prob > 1) throw new RangeError('invalid p')
    return function (): number {
      return Math.floor(source() + prob)
    }
  }

  randomBernoulli.source = sourceRandomBernoulli

  return randomBernoulli
}

const randomBernoulli: RandomBernoulli = sourceRandomBernoulli(defaultSource)
export default randomBernoulli
