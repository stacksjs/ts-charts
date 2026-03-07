import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'
import normal from './normal.ts'

export interface RandomLogNormal {
  (mu?: number, sigma?: number): () => number
  source(source: RandomSource): RandomLogNormal
}

function sourceRandomLogNormal(source: RandomSource): RandomLogNormal {
  const N = normal.source(source)

  function randomLogNormal(mu?: number, sigma?: number): () => number {
    const randomNormal = N(mu, sigma)
    return function (): number {
      return Math.exp(randomNormal())
    }
  }

  randomLogNormal.source = sourceRandomLogNormal

  return randomLogNormal
}

const randomLogNormal: RandomLogNormal = sourceRandomLogNormal(defaultSource)
export default randomLogNormal
