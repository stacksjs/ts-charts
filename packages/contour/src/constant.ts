export default function constant<T>(x: T): () => T {
  return (): T => x
}
