import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'
import gamma from './gamma.ts'

export interface RandomBeta {
  (alpha: number, beta: number): () => number
  source(source: RandomSource): RandomBeta
}

function sourceRandomBeta(source: RandomSource): RandomBeta {
  const G = gamma.source(source)

  function randomBeta(alpha: number, beta: number): () => number {
    const X = G(alpha)
    const Y = G(beta)
    return function (): number {
      const x = X()
      return x === 0 ? 0 : x / (x + Y())
    }
  }

  randomBeta.source = sourceRandomBeta

  return randomBeta
}

const randomBeta: RandomBeta = sourceRandomBeta(defaultSource)
export default randomBeta
