import { utcYear, utcMonth, utcWeek, utcDay, utcHour, utcMinute, utcSecond, utcTicks, utcTickInterval } from '@ts-charts/time'
import { utcFormat } from '@ts-charts/time-format'
import { calendar } from './time.ts'
import { initRange } from './init.ts'
import type { ContinuousScale } from './continuous.ts'

export default function utcTime(): ContinuousScale {
  // The utc module functions are compatible at runtime; cast needed due to complex overload signatures
  const cal = calendar(
    utcTicks as unknown as Parameters<typeof calendar>[0],
    utcTickInterval as unknown as Parameters<typeof calendar>[1],
    utcYear as unknown as Parameters<typeof calendar>[2],
    utcMonth as unknown as Parameters<typeof calendar>[3],
    utcWeek as unknown as Parameters<typeof calendar>[4],
    utcDay as unknown as Parameters<typeof calendar>[5],
    utcHour as unknown as Parameters<typeof calendar>[6],
    utcMinute as unknown as Parameters<typeof calendar>[7],
    utcSecond as unknown as Parameters<typeof calendar>[8],
    utcFormat as unknown as Parameters<typeof calendar>[9]
  )
  const scaled = cal.domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]) as ContinuousScale
  return initRange.apply(scaled, arguments as unknown as []) as unknown as ContinuousScale
}
