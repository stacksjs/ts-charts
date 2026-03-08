# Data Processing

ts-charts includes a comprehensive data processing toolkit through `@ts-charts/array` and `@ts-charts/dsv`, covering statistics, binning, grouping, sorting, and delimited text parsing.

## Statistics

```ts
import { min, max, extent, mean, median, deviation, variance, sum, quantile } from '@ts-charts/array'

const data = [4, 8, 15, 16, 23, 42]

min(data)        // 4
max(data)        // 42
extent(data)     // [4, 42]
mean(data)       // 18
median(data)     // 15.5
deviation(data)  // 13.28
sum(data)        // 108
quantile(data, 0.25) // 9.75
```

## Binning (Histograms)

```ts
import { bin } from '@ts-charts/array'

const values = [1, 2, 2, 3, 3, 3, 4, 4, 5]

const histogram = bin()
  .domain([0, 6])
  .thresholds(5)

const bins = histogram(values)
// each bin has: x0 (start), x1 (end), and array of values
```

## Grouping and Rollup

```ts
import { group, rollup, groupSort } from '@ts-charts/array'

const people = [
  { name: 'Alice', dept: 'Engineering' },
  { name: 'Bob', dept: 'Engineering' },
  { name: 'Carol', dept: 'Marketing' },
]

// group into a Map
const byDept = group(people, d => d.dept)
byDept.get('Engineering') // [Alice, Bob]

// rollup with aggregation
const counts = rollup(people, v => v.length, d => d.dept)
counts.get('Engineering') // 2
```

## Sorting and Searching

```ts
import { ascending, descending, sort, bisect, bisector } from '@ts-charts/array'

const nums = [3, 1, 4, 1, 5, 9]
sort(nums, ascending)  // [1, 1, 3, 4, 5, 9]
sort(nums, descending) // [9, 5, 4, 3, 1, 1]

// binary search in sorted array
const sorted = [10, 20, 30, 40, 50]
bisect(sorted, 25) // 2 (insert position)

// custom bisector for objects
const items = [{ date: new Date(2020, 0) }, { date: new Date(2021, 0) }]
const byDate = bisector((d: any) => d.date)
byDate.left(items, new Date(2020, 6)) // 1
```

## CSV and TSV Parsing

```ts
import { csvParse, csvFormat, tsvParse, autoType } from '@ts-charts/dsv'

// parse CSV string
const data = csvParse(`name,age
Alice,30
Bob,25`)
// [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]

// with auto type conversion
const typed = csvParse(`name,age
Alice,30
Bob,25`, autoType)
// [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]

// format back to CSV
csvFormat([{ name: 'Alice', age: 30 }])
// 'name,age\nAlice,30'
```

## Set Operations

```ts
import { difference, intersection, union, superset } from '@ts-charts/array'

const a = [1, 2, 3, 4]
const b = [3, 4, 5, 6]

difference(a, b)     // Set {1, 2}
intersection(a, b)   // Set {3, 4}
union(a, b)          // Set {1, 2, 3, 4, 5, 6}
superset(a, [1, 2])  // true
```

## Ticks and Ranges

```ts
import { ticks, range, nice } from '@ts-charts/array'

ticks(0, 10, 5)   // [0, 2, 4, 6, 8, 10]
range(0, 1, 0.2)  // [0, 0.2, 0.4, 0.6, 0.8]
range(10)          // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```
