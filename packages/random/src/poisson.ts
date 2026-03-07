import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'
import binomial from './binomial.ts'
import gamma from './gamma.ts'

export interface RandomPoisson {
  (lambda: number): () => number
  source(source: RandomSource): RandomPoisson
}

function sourceRandomPoisson(source: RandomSource): RandomPoisson {
  const G = gamma.source(source)
  const B = binomial.source(source)

  function randomPoisson(lambda: number): () => number {
    return function (): number {
      let acc = 0
      let l = lambda
      while (l > 16) {
        const n = Math.floor(0.875 * l)
        const t = G(n)()
        if (t > l) return acc + B(n - 1, l / t)()
        acc += n
        l -= t
      }
      let s = -Math.log1p(-source())
      let k = 0
      for (; s <= l; ++k) s -= Math.log1p(-source())
      return acc + k
    }
  }

  randomPoisson.source = sourceRandomPoisson

  return randomPoisson
}

const randomPoisson: RandomPoisson = sourceRandomPoisson(defaultSource)
export default randomPoisson
