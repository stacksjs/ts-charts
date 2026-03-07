export default function permute<T>(source: ArrayLike<T>, keys: Iterable<number>): T[] {
  return Array.from(keys, (key: number) => source[key])
}
