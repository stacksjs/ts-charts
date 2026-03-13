import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomWeibull {
  (k: number, a?: number, b?: number): () => number
  source(source: RandomSource): RandomWeibull
// eslint-disable-next-line pickier/no-unused-vars
}

function sourceRandomWeibull(source: RandomSource): RandomWeibull {
  function randomWeibull(k: number, a?: number, b?: number): () => number {
    let outerFunc: (x: number) => number
    let kk = +k
    if (kk === 0) {
      outerFunc = (x: number): number => -Math.log(x)
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else {
      kk = 1 / kk
      outerFunc = (x: number): number => Math.pow(x, kk)
    }
    const loc = a == null ? 0 : +a
    const scale = b == null ? 1 : +b
    return function (): number {
      return loc + scale * outerFunc(-Math.log1p(-source()))
    }
  }

  randomWeibull.source = sourceRandomWeibull

  return randomWeibull
}

const randomWeibull: RandomWeibull = sourceRandomWeibull(defaultSource)
export default randomWeibull
