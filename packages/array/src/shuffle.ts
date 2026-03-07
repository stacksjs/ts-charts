export function shuffler(random: () => number): <T>(array: T[], i0?: number, i1?: number) => T[] {
  return function shuffle<T>(array: T[], i0: number = 0, i1: number = array.length): T[] {
    let m = i1 - (i0 = +i0)
    while (m) {
      const i = random() * m-- | 0
      const t = array[m + i0]
      array[m + i0] = array[i + i0]
      array[i + i0] = t
    }
    return array
  }
}

const shuffle: <T>(array: T[], i0?: number, i1?: number) => T[] = shuffler(Math.random)
export default shuffle
