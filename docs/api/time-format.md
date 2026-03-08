# Time Format

Locale-sensitive date and time formatting and parsing.

## Installation

```bash
bun add @ts-charts/time-format
```

## Exports

`timeFormat`, `timeParse`, `utcFormat`, `utcParse`, `timeFormatDefaultLocale`, `timeFormatLocale`, `isoFormat`, `isoSpecifier`, `isoParse`

**Types:** `TimeLocaleDefinition`, `TimeLocaleObject`

## Usage

```ts
import { timeFormat, timeParse, utcFormat, isoParse } from '@ts-charts/time-format'

const formatDate = timeFormat('%B %d, %Y')
formatDate(new Date(2024, 5, 15))  // 'June 15, 2024'

const formatTime = timeFormat('%H:%M:%S')
formatTime(new Date())  // '14:30:00'

const parse = timeParse('%Y-%m-%d')
parse('2024-06-15')  // Date object

const iso = isoParse('2024-06-15T12:00:00Z')
```
