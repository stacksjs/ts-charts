export default function descending(a: number, b: number): number {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN
}
