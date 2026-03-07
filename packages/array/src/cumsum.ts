export default function cumsum(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): Float64Array {
  let sum = 0
  let index = 0
  return Float64Array.from(values as any, valueof === undefined
    ? (v: any) => (sum += +v || 0)
    : (v: any) => (sum += +valueof(v, index++, values) || 0))
}
