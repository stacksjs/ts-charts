# Fetch

Convenience methods for fetching and parsing remote data.

## Installation

```bash
bun add @ts-charts/fetch
```

## Exports

`blob`, `buffer`, `dsv`, `csv`, `tsv`, `image`, `json`, `text`, `xml`, `html`, `svg`

## Usage

```ts
import { json, csv, text } from '@ts-charts/fetch'

const data = await json('https://example.com/data.json')

const rows = await csv('https://example.com/data.csv')

const content = await text('https://example.com/file.txt')
```
