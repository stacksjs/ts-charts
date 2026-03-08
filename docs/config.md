# Configuration

ts-charts works out of the box with zero configuration. However, you can customize behavior through package-level options.

## Locale Configuration

### Number Formatting

```ts
import { formatDefaultLocale } from 'ts-charts'

formatDefaultLocale({
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', '\u00a0EUR'],
})
```

### Time Formatting

```ts
import { timeFormatDefaultLocale } from 'ts-charts'

timeFormatDefaultLocale({
  dateTime: '%A, %e %B %Y г. %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
})
```

## Package Selection

Import from individual packages for smaller bundles:

```ts
// instead of
import { scaleLinear, line, axisBottom } from 'ts-charts'

// use individual packages
import { scaleLinear } from '@ts-charts/scale'
import { line } from '@ts-charts/shape'
import { axisBottom } from '@ts-charts/axis'
```

## TypeScript Configuration

ts-charts supports `isolatedDeclarations`. Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "esnext",
    "target": "esnext"
  }
}
```
