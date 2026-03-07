export function roundEpsilon(x: number): number {
  return Math.round(x * 1e12) / 1e12
}
