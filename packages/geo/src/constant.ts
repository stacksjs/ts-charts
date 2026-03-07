export default function constant<T>(x: T): () => T {
  return function (): T {
    return x
  }
}
