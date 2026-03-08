# Selection

DOM element selection and manipulation.

## Installation

```bash
bun add @ts-charts/selection
```

## Exports

`select`, `selectAll`, `selection`, `Selection`, `create`, `creator`, `selector`, `selectorAll`, `matcher`, `pointer`, `pointers`, `local`, `Local`, `namespace`, `namespaces`, `style`, `window`, `EnterNode`

**Types:** `NamespaceLocal`, `Namespaces`

## Usage

```ts
import { select, selectAll, create, pointer } from '@ts-charts/selection'

// select and modify
select('#chart')
  .append('svg')
  .attr('width', 500)
  .attr('height', 300)

// select all matching elements
selectAll('circle')
  .attr('fill', 'steelblue')
  .attr('r', 5)

// create detached elements
const div = create('div')
  .attr('class', 'tooltip')
  .text('Hello')

// get pointer coordinates
svg.on('click', (event) => {
  const [x, y] = pointer(event)
})
```
