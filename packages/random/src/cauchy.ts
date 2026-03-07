import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomCauchy {
  (a?: number, b?: number): () => number
  source(source: RandomSource): RandomCauchy
}

function sourceRandomCauchy(source: RandomSource): RandomCauchy {
  function randomCauchy(a?: number, b?: number): () => number {
    const loc = a == null ? 0 : +a
    const scale = b == null ? 1 : +b
    return function (): number {
      return loc + scale * Math.tan(Math.PI * source())
    }
  }

  randomCauchy.source = sourceRandomCauchy

  return randomCauchy
}

const randomCauchy: RandomCauchy = sourceRandomCauchy(defaultSource)
export default randomCauchy
