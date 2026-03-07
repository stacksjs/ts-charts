import variance from './variance.ts'

export default function deviation(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): number | undefined {
  const v = variance(values, valueof)
  return v ? Math.sqrt(v) : v
}
