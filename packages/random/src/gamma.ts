import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'
import normal from './normal.ts'

export interface RandomGamma {
  (k: number, theta?: number): () => number
  source(source: RandomSource): RandomGamma
}

function sourceRandomGamma(source: RandomSource): RandomGamma {
  const randomNormal = normal.source(source)()

  function randomGamma(k: number, theta?: number): () => number {
    const kk = +k
    if (kk < 0) throw new RangeError('invalid k')
    // degenerate distribution if k === 0
    if (kk === 0) return (): number => 0
    const t = theta == null ? 1 : +theta
    // exponential distribution if k === 1
    if (kk === 1) return (): number => -Math.log1p(-source()) * t

    const d = (kk < 1 ? kk + 1 : kk) - 1 / 3
    const c = 1 / (3 * Math.sqrt(d))
    const multiplier = kk < 1 ? (): number => Math.pow(source(), 1 / kk) : (): number => 1
    return function (): number {
      let x: number, v: number, u: number
      do {
        do {
          x = randomNormal()
          v = 1 + c * x
        } while (v <= 0)
        v *= v * v
        u = 1 - source()
      } while (u >= 1 - 0.0331 * x * x * x * x && Math.log(u) >= 0.5 * x * x + d * (1 - v + Math.log(v)))
      return d * v * multiplier() * t
    }
  }

  randomGamma.source = sourceRandomGamma

  return randomGamma
}

const randomGamma: RandomGamma = sourceRandomGamma(defaultSource)
export default randomGamma
