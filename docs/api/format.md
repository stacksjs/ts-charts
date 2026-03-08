# Format

Locale-aware number formatting.

## Installation

```bash
bun add @ts-charts/format
```

## Exports

`format`, `formatPrefix`, `formatDefaultLocale`, `formatLocale`, `formatSpecifier`, `FormatSpecifier`, `precisionFixed`, `precisionPrefix`, `precisionRound`

**Types:** `LocaleDefinition`, `LocaleObject`, `FormatOptions`, `FormatSpecifierObject`

## Usage

```ts
import { format, formatPrefix, precisionFixed } from '@ts-charts/format'

format('.2f')(3.14159)      // '3.14'
format(',')(1234567)        // '1,234,567'
format('.2s')(42e6)         // '42M'
format('.2%')(0.123)        // '12.30%'

const p = formatPrefix('.1', 1e6)
p(1234567)                  // '1.2M'

precisionFixed(0.5)         // 1
```
