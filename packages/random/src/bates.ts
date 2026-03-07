import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'
import irwinHall from './irwinHall.ts'

export interface RandomBates {
  (n: number): () => number
  source(source: RandomSource): RandomBates
}

function sourceRandomBates(source: RandomSource): RandomBates {
  const I = irwinHall.source(source)

  function randomBates(n: number): () => number {
    const count = +n
    // use limiting distribution at n === 0
    if (count === 0) return source
    const randomIrwinHall = I(count)
    return function (): number {
      return randomIrwinHall() / count
    }
  }

  randomBates.source = sourceRandomBates

  return randomBates
}

const randomBates: RandomBates = sourceRandomBates(defaultSource)
export default randomBates
