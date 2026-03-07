import type { TimeInterval } from './interval.ts'
import { bisector, tickStep } from '@ts-charts/array'
import { durationDay, durationHour, durationMinute, durationMonth, durationSecond, durationWeek, durationYear } from './duration.ts'
import { millisecond } from './millisecond.ts'
import { second } from './second.ts'
import { timeMinute, utcMinute } from './minute.ts'
import { timeHour, utcHour } from './hour.ts'
import { timeDay, unixDay } from './day.ts'
import { timeSunday, utcSunday } from './week.ts'
import { timeMonth, utcMonth } from './month.ts'
import { timeYear, utcYear } from './year.ts'

function ticker(
  year: TimeInterval,
  month: TimeInterval,
  week: TimeInterval,
  day: TimeInterval,
  hour: TimeInterval,
  minute: TimeInterval,
): [(start: Date | number, stop: Date | number, count: TimeInterval | number) => Date[], (start: Date | number, stop: Date | number, count: number) => TimeInterval | null | undefined] {

  const tickIntervals: [TimeInterval, number, number][] = [
    [second,  1,      durationSecond],
    [second,  5,  5 * durationSecond],
    [second, 15, 15 * durationSecond],
    [second, 30, 30 * durationSecond],
    [minute,  1,      durationMinute],
    [minute,  5,  5 * durationMinute],
    [minute, 15, 15 * durationMinute],
    [minute, 30, 30 * durationMinute],
    [  hour,  1,      durationHour  ],
    [  hour,  3,  3 * durationHour  ],
    [  hour,  6,  6 * durationHour  ],
    [  hour, 12, 12 * durationHour  ],
    [   day,  1,      durationDay   ],
    [   day,  2,  2 * durationDay   ],
    [  week,  1,      durationWeek  ],
    [ month,  1,      durationMonth ],
    [ month,  3,  3 * durationMonth ],
    [  year,  1,      durationYear  ],
  ]

  function ticks(start: Date | number, stop: Date | number, count: TimeInterval | number): Date[] {
    const reverse: boolean = stop < start
    if (reverse) [start, stop] = [stop, start]
    const interval: TimeInterval | null | undefined = count && typeof (count as TimeInterval).range === 'function' ? count as TimeInterval : tickInterval(start, stop, count as number)
    const t: Date[] = interval ? interval.range(start, +stop + 1) : [] // inclusive stop
    return reverse ? t.reverse() : t
  }

  function tickInterval(start: Date | number, stop: Date | number, count: number): TimeInterval | null | undefined {
    const target: number = Math.abs(+stop - +start) / count
    const i: number = bisector(([,, step]: [TimeInterval, number, number]): number => step).right(tickIntervals, target)
    if (i === tickIntervals.length) return year.every!(tickStep(+start / durationYear, +stop / durationYear, count))
    if (i === 0) return millisecond.every!(Math.max(tickStep(+start, +stop, count), 1))
    const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i]
    return t.every!(step)
  }

  return [ticks, tickInterval]
}

const [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcSunday, unixDay, utcHour, utcMinute)
const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute)

export { utcTicks, utcTickInterval, timeTicks, timeTickInterval }
