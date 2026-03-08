# Zoom

Pan and zoom interaction for SVG and HTML elements.

## Installation

```bash
bun add @ts-charts/zoom
```

## Exports

`zoom`, `zoomTransform`, `zoomIdentity`, `ZoomTransform`

## Usage

```ts
import { zoom, zoomTransform, zoomIdentity } from '@ts-charts/zoom'
import { select } from '@ts-charts/selection'

const zoomBehavior = zoom()
  .scaleExtent([0.5, 8])
  .on('zoom', (event) => {
    const { x, y, k } = event.transform
    svg.attr('transform', `translate(${x},${y}) scale(${k})`)
  })

select('svg').call(zoomBehavior)

// programmatic zoom
select('svg')
  .transition()
  .call(zoomBehavior.scaleTo, 2)

// reset zoom
select('svg')
  .call(zoomBehavior.transform, zoomIdentity)

// read current transform
const t = zoomTransform(svgNode)
console.log(t.k, t.x, t.y)
```
