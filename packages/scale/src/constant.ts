export default function constants<T>(x: T): () => T {
  return function (): T {
    return x
  }
}
