export default function constant(x: number): () => number {
  return function (): number {
    return x
  }
}
