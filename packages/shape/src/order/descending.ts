import ascending from './ascending.ts'

export default function orderDescending(series: any[]): number[] {
  return ascending(series).reverse()
}
