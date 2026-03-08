# Time

Time interval definitions and utilities for date manipulation.

## Installation

```bash
bun add @ts-charts/time
```

## Exports

### Factory
`timeInterval`

### Local Time
`timeMillisecond`, `timeMilliseconds`, `timeSecond`, `timeSeconds`, `timeMinute`, `timeMinutes`, `timeHour`, `timeHours`, `timeDay`, `timeDays`, `timeWeek`, `timeWeeks`, `timeSunday`, `timeSundays`, `timeMonday`, `timeMondays`, `timeTuesday`, `timeTuesdays`, `timeWednesday`, `timeWednesdays`, `timeThursday`, `timeThursdays`, `timeFriday`, `timeFridays`, `timeSaturday`, `timeSaturdays`, `timeMonth`, `timeMonths`, `timeYear`, `timeYears`, `timeTicks`, `timeTickInterval`

### UTC Time
`utcMillisecond`, `utcMilliseconds`, `utcSecond`, `utcSeconds`, `utcMinute`, `utcMinutes`, `utcHour`, `utcHours`, `utcDay`, `utcDays`, `unixDay`, `unixDays`, `utcWeek`, `utcWeeks`, `utcSunday`, `utcSundays`, `utcMonday`, `utcMondays`, `utcTuesday`, `utcTuesdays`, `utcWednesday`, `utcWednesdays`, `utcThursday`, `utcThursdays`, `utcFriday`, `utcFridays`, `utcSaturday`, `utcSaturdays`, `utcMonth`, `utcMonths`, `utcYear`, `utcYears`, `utcTicks`, `utcTickInterval`

**Types:** `TimeInterval`

## Usage

```ts
import { timeDay, timeMonth, timeYear, utcDay } from '@ts-charts/time'

const now = new Date()
timeDay.floor(now)    // start of today (local)
timeDay.ceil(now)     // start of tomorrow (local)
timeMonth.round(now)  // nearest month boundary

// generate date ranges
timeDay.range(new Date(2024, 0, 1), new Date(2024, 0, 7))
// [Jan 1, Jan 2, Jan 3, Jan 4, Jan 5, Jan 6]

timeDay.count(new Date(2024, 0, 1), new Date(2024, 6, 1))
// days between dates
```
