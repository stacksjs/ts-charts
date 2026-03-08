# Hierarchy

Hierarchical data layouts: tree, treemap, pack, partition, and cluster.

## Installation

```bash
bun add @ts-charts/hierarchy
```

## Exports

`hierarchy`, `HierarchyNode`, `cluster`, `tree`, `treemap`, `treemapBinary`, `treemapDice`, `treemapSlice`, `treemapSliceDice`, `treemapSquarify`, `treemapResquarify`, `pack`, `packSiblings`, `packEnclose`, `partition`, `stratify`

**Types:** `HierarchyLink`

## Usage

```ts
import { hierarchy, tree, treemap } from '@ts-charts/hierarchy'

const data = {
  name: 'root',
  children: [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', children: [
      { name: 'C1', value: 5 },
      { name: 'C2', value: 15 },
    ]},
  ],
}

const root = hierarchy(data).sum(d => d.value)

// tree layout
const treeLayout = tree().size([400, 300])
treeLayout(root)

// treemap layout
const treemapLayout = treemap().size([500, 400]).padding(2)
treemapLayout(root)
```
