import quantile, { quantileIndex } from './quantile.ts'

export default function median(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): number | undefined {
  return quantile(values, 0.5, valueof)
}

export function medianIndex(values: ArrayLike<any>, valueof?: (value: any, index: number, values: ArrayLike<any>) => number): number {
  return quantileIndex(values, 0.5, valueof)
}
