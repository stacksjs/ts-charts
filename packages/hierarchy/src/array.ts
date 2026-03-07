export default function toArray<T>(x: ArrayLike<T> | Iterable<T>): T[] {
  return typeof x === 'object' && 'length' in x
    ? Array.prototype.slice.call(x) as T[]
    : Array.from(x as Iterable<T>)
}

export function shuffle<T>(array: T[], random: () => number): T[] {
  let m = array.length
  let t: T
  let i: number

  while (m) {
    i = random() * m-- | 0
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }

  return array
}
