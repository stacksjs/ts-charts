import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'
import beta from './beta.ts'
import geometric from './geometric.ts'

export interface RandomBinomial {
  (n: number, p: number): () => number
  source(source: RandomSource): RandomBinomial
}

function sourceRandomBinomial(source: RandomSource): RandomBinomial {
  const G = geometric.source(source)
  const B = beta.source(source)

  function randomBinomial(n: number, p: number): () => number {
    const nn0 = +n
    const pp0 = +p
    if (pp0 >= 1) return (): number => nn0
    if (pp0 <= 0) return (): number => 0
    return function (): number {
      let acc = 0
      let nn = nn0
      let pp = pp0
      while (nn * pp > 16 && nn * (1 - pp) > 16) {
        const i = Math.floor((nn + 1) * pp)
        const y = B(i, nn - i + 1)()
        if (y <= pp) {
          acc += i
          nn -= i
          pp = (pp - y) / (1 - y)
        } else {
          nn = i - 1
          pp /= y
        }
      }
      const sign = pp < 0.5
      const pFinal = sign ? pp : 1 - pp
      const g = G(pFinal)
      let s = g()
      let k = 0
      for (; s <= nn; ++k) s += g()
      return acc + (sign ? k : nn - k)
    }
  }

  randomBinomial.source = sourceRandomBinomial

  return randomBinomial
}

const randomBinomial: RandomBinomial = sourceRandomBinomial(defaultSource)
export default randomBinomial
