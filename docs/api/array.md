# Array

Array manipulation, statistics, histograms, and data grouping utilities.

## Installation

```bash
bun add @ts-charts/array
```

## Exports

### Statistics

`min`, `minIndex`, `max`, `maxIndex`, `extent`, `mean`, `median`, `medianIndex`, `mode`, `sum`, `cumsum`, `deviation`, `variance`, `quantile`, `quantileIndex`, `quantileSorted`, `rank`, `fsum`, `fcumsum`, `Adder`

### Sorting & Searching

`ascending`, `descending`, `bisect`, `bisectLeft`, `bisectRight`, `bisectCenter`, `bisector`, `quickselect`, `sort`, `scan`

### Transformations

`group`, `groups`, `flatGroup`, `flatRollup`, `rollup`, `rollups`, `index`, `indexes`, `groupSort`, `count`, `cross`, `merge`, `pairs`, `permute`, `range`, `shuffle`, `shuffler`, `ticks`, `tickIncrement`, `tickStep`, `nice`, `transpose`, `zip`

### Histograms

`bin` (alias `histogram`), `thresholdFreedmanDiaconis`, `thresholdScott`, `thresholdSturges`

### Blur

`blur`, `blur2`, `blurImage`

### Iterables

`every`, `some`, `filter`, `map`, `reduce`, `reverse`, `least`, `leastIndex`, `greatest`, `greatestIndex`

### Sets

`difference`, `disjoint`, `intersection`, `subset`, `superset`, `union`

### Data Structures

`InternMap`, `InternSet`

## Usage

```ts
import { mean, extent, group, bin } from '@ts-charts/array'

const data = [3, 1, 4, 1, 5, 9, 2, 6]

mean(data)    // 3.875
extent(data)  // [1, 9]

const histogram = bin().thresholds(10)
histogram(data)
```
