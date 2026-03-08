# Force

Force-directed graph layout simulation.

## Installation

```bash
bun add @ts-charts/force
```

## Exports

`forceSimulation`, `forceCenter`, `forceCollide`, `forceLink`, `forceManyBody`, `forceRadial`, `forceX`, `forceY`

## Usage

```ts
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
} from '@ts-charts/force'

const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
const links = [
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' },
]

const simulation = forceSimulation(nodes)
  .force('link', forceLink(links).id(d => d.id))
  .force('charge', forceManyBody().strength(-100))
  .force('center', forceCenter(250, 250))
  .on('tick', () => {
    // update node/link positions
  })
```
