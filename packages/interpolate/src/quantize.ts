export default function quantize<T>(interpolator: (t: number) => T, n: number): T[] {
  const samples = new Array<T>(n)
  for (let i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1))
  return samples
}
