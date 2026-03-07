export function constantZero(): number {
  return 0
}

export default function constant(x: number): () => number {
  return function (): number {
    return x
  }
}
