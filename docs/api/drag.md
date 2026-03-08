# Drag

Drag interaction behavior for mouse and touch events.

## Installation

```bash
bun add @ts-charts/drag
```

## Exports

`drag`, `dragDisable`, `dragEnable`

## Usage

```ts
import { drag } from '@ts-charts/drag'
import { select } from '@ts-charts/selection'

const dragBehavior = drag()
  .on('start', (event) => {
    // drag started
  })
  .on('drag', (event) => {
    select(event.sourceEvent.target)
      .attr('cx', event.x)
      .attr('cy', event.y)
  })
  .on('end', (event) => {
    // drag ended
  })

select('circle').call(dragBehavior)
```
