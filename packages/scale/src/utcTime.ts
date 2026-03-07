import { utcYear, utcMonth, utcWeek, utcDay, utcHour, utcMinute, utcSecond, utcTicks, utcTickInterval } from '@ts-charts/time'
import { utcFormat } from '@ts-charts/time-format'
import { calendar } from './time.ts'
import { initRange } from './init.ts'

export default function utcTime(): any {
  return initRange.apply(calendar(utcTicks, utcTickInterval, utcYear, utcMonth, utcWeek, utcDay, utcHour, utcMinute, utcSecond, utcFormat).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]), arguments as any)
}
