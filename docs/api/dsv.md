# DSV

Delimiter-separated values (CSV, TSV) parsing and formatting.

## Installation

```bash
bun add @ts-charts/dsv
```

## Exports

`dsvFormat`, `csvParse`, `csvParseRows`, `csvFormat`, `csvFormatBody`, `csvFormatRows`, `csvFormatRow`, `csvFormatValue`, `tsvParse`, `tsvParseRows`, `tsvFormat`, `tsvFormatBody`, `tsvFormatRows`, `tsvFormatRow`, `tsvFormatValue`, `autoType`

**Types:** `DSV`, `DSVParsedArray`, `DSVRowConverter`, `DSVRowString`, `DSVRowsConverter`

## Usage

```ts
import { csvParse, tsvFormat, autoType } from '@ts-charts/dsv'

const data = csvParse('name,value\nAlice,10\nBob,20', autoType)
// [{ name: 'Alice', value: 10 }, { name: 'Bob', value: 20 }]

const tsv = tsvFormat([
  { name: 'Alice', value: 10 },
  { name: 'Bob', value: 20 },
])
// 'name\tvalue\nAlice\t10\nBob\t20'
```
