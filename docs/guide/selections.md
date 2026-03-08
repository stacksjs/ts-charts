# Selections

The Selection API (from `@ts-charts/selection`) is the foundation for DOM manipulation in ts-charts.

## Selecting Elements

```ts
import { select, selectAll } from 'ts-charts'

// select a single element
const svg = select('svg')

// select multiple elements
const circles = selectAll('circle')
```

## Modifying Elements

Selections provide a fluent API for setting attributes, styles, and properties:

```ts
select('svg')
  .attr('width', 500)
  .attr('height', 300)
  .style('background', '#f0f0f0')
```

## Creating Elements

Use `append` to add child elements:

```ts
const svg = select('#chart')
  .append('svg')
  .attr('width', 500)
  .attr('height', 300)

svg.append('circle')
  .attr('cx', 250)
  .attr('cy', 150)
  .attr('r', 50)
  .attr('fill', 'steelblue')
```

## Key Exports

`select`, `selectAll`, `create`, `creator`, `selection`, `Selection`, `selector`, `selectorAll`, `pointer`, `pointers`, `local`, `matcher`, `namespace`, `namespaces`, `style`, `window`, `EnterNode`

See the full [Selection API Reference](/api/selection) for details.
