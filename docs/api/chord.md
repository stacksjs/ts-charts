# Chord

Chord diagram layout and ribbon shape generators for visualizing relationships between groups.

## Installation

```bash
bun add @ts-charts/chord
```

## Exports

`chord`, `chordTranspose`, `chordDirected`, `ribbon`, `ribbonArrow`

**Types:** `ChordLayout`, `ChordGroup`, `ChordSubgroup`, `Chord`, `Chords`, `Comparator`, `RibbonGenerator`

## Usage

```ts
import { chord, ribbon } from '@ts-charts/chord'

const matrix = [
  [11975, 5871, 8916, 2868],
  [1951, 10048, 2060, 6171],
  [8010, 16145, 8090, 8045],
  [1013, 990, 940, 6907],
]

const chordLayout = chord()(matrix)
const ribbonGen = ribbon().radius(200)

chordLayout.forEach(d => {
  const path = ribbonGen(d)
})
```
