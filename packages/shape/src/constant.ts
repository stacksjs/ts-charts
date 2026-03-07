export default function constant<T>(x: T): () => T {
  return function constant(): T {
    return x
  }
}
