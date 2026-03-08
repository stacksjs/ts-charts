# Layouts

ts-charts provides several layout algorithms for hierarchical and relational data through `@ts-charts/hierarchy`, `@ts-charts/chord`, and `@ts-charts/force`.

## Hierarchy Layouts

Convert tabular or nested data into hierarchical layouts:

```ts
import { hierarchy, treemap, pack, tree, partition, cluster } from '@ts-charts/hierarchy'

const data = {
  name: 'root',
  children: [
    { name: 'A', value: 10 },
    { name: 'B', children: [
      { name: 'B1', value: 5 },
      { name: 'B2', value: 8 },
    ]},
  ],
}

const root = hierarchy(data)
  .sum(d => d.value)
  .sort((a, b) => b.value - a.value)
```

### Treemap

Rectangular subdivision proportional to value:

```ts
const treemapLayout = treemap()
  .size([960, 500])
  .padding(2)

treemapLayout(root)
// each node gets x0, y0, x1, y1
root.leaves().forEach(d => {
  console.log(d.data.name, d.x0, d.y0, d.x1, d.y1)
})
```

### Circle Packing

Nested circles proportional to value:

```ts
const packLayout = pack()
  .size([960, 960])
  .padding(3)

packLayout(root)
// each node gets x, y, r
```

### Tree (Tidy)

Reingold-Tilford tidy tree:

```ts
const treeLayout = tree()
  .size([960, 500])

treeLayout(root)
// each node gets x, y
```

### Partition

Adjacency diagram (icicle/sunburst):

```ts
const partitionLayout = partition()
  .size([960, 500])

partitionLayout(root)
// each node gets x0, y0, x1, y1
```

## Stratify

Create a hierarchy from flat tabular data:

```ts
import { stratify } from '@ts-charts/hierarchy'

const table = [
  { id: 'root', parent: null },
  { id: 'A', parent: 'root' },
  { id: 'B', parent: 'root' },
  { id: 'B1', parent: 'B' },
]

const root = stratify()
  .id(d => d.id)
  .parentId(d => d.parent)
  (table)
```

## Chord Diagrams

Visualize relationships between groups:

```ts
import { chord, ribbon } from '@ts-charts/chord'

const matrix = [
  [11975, 5871, 8916, 2868],
  [1951, 10048, 2060, 6171],
  [8010, 16145, 8090, 8045],
  [1013, 990, 940, 6907],
]

const chords = chord()(matrix)
// chords.groups: arc segments for each group
// chords: ribbons connecting groups

const ribbonGenerator = ribbon()
// use with SVG path: ribbonGenerator(chord)
```

## Force-Directed Graphs

Simulate physical forces for graph layout:

```ts
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from '@ts-charts/force'

const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
const links = [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }]

const simulation = forceSimulation(nodes)
  .force('link', forceLink(links).id(d => d.id))
  .force('charge', forceManyBody().strength(-100))
  .force('center', forceCenter(480, 250))
  .force('collide', forceCollide(20))

simulation.on('tick', () => {
  // nodes now have x, y positions
  nodes.forEach(d => console.log(d.id, d.x, d.y))
})
```
