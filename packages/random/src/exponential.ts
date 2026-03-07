import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomExponential {
  (lambda: number): () => number
  source(source: RandomSource): RandomExponential
}

function sourceRandomExponential(source: RandomSource): RandomExponential {
  function randomExponential(lambda: number): () => number {
    return function (): number {
      return -Math.log1p(-source()) / lambda
    }
  }

  randomExponential.source = sourceRandomExponential

  return randomExponential
}

const randomExponential: RandomExponential = sourceRandomExponential(defaultSource)
export default randomExponential
