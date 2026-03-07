import type { RandomSource } from './defaultSource.ts'
import defaultSource from './defaultSource.ts'

export interface RandomIrwinHall {
  (n: number): () => number
  source(source: RandomSource): RandomIrwinHall
}

function sourceRandomIrwinHall(source: RandomSource): RandomIrwinHall {
  function randomIrwinHall(n: number): () => number {
    const count = +n
    if (count <= 0) return (): number => 0
    return function (): number {
      let sum = 0
      let i = count
      for (; i > 1; --i) sum += source()
      return sum + i * source()
    }
  }

  randomIrwinHall.source = sourceRandomIrwinHall

  return randomIrwinHall
}

const randomIrwinHall: RandomIrwinHall = sourceRandomIrwinHall(defaultSource)
export default randomIrwinHall
