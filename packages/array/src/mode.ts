import { InternMap } from '@ts-charts/internmap'

export default function mode(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): any {
  const counts = new InternMap()
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && value >= value) {
        counts.set(value, ((counts.get(value) as number) || 0) + 1)
      }
    }
  }
  else {
    let index = -1
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && value >= value) {
        counts.set(value, ((counts.get(value) as number) || 0) + 1)
      }
    }
  }
  let modeValue: any
  let modeCount = 0
  for (const [value, count] of counts) {
    if ((count as number) > modeCount) {
      modeCount = count as number
      modeValue = value
    }
  }
  return modeValue
}
