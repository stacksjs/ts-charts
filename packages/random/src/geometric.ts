import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomGeometric {
  (p: number): () => number
  source(source: RandomSource): RandomGeometric
}

function sourceRandomGeometric(source: RandomSource): RandomGeometric {
  function randomGeometric(p: number): () => number {
    let prob = +p
    if (prob < 0 || prob > 1) throw new RangeError('invalid p')
    if (prob === 0) return (): number => Infinity
    if (prob === 1) return (): number => 1
    prob = Math.log1p(-prob)
    return function (): number {
      return 1 + Math.floor(Math.log1p(-source()) / prob)
    }
  }

  randomGeometric.source = sourceRandomGeometric

  return randomGeometric
}

const randomGeometric: RandomGeometric = sourceRandomGeometric(defaultSource)
export default randomGeometric
