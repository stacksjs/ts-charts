# Interactions

ts-charts provides three interaction primitives — drag, brush, and zoom — that work with the selection and transition system to create interactive visualizations.

## Drag

Enable drag-and-drop behavior on any element:

```ts
import { drag } from '@ts-charts/drag'
import { select } from '@ts-charts/selection'

const dragBehavior = drag()
  .on('start', (event) => {
    // event.x, event.y — current position
    // event.subject — the dragged datum
  })
  .on('drag', (event) => {
    select(event.sourceEvent.target)
      .attr('cx', event.x)
      .attr('cy', event.y)
  })
  .on('end', (event) => {
    // drag finished
  })

select('svg')
  .selectAll('circle')
  .call(dragBehavior)
```

### Touch Support

Drag automatically supports multi-touch on mobile devices. Use `touchable` to control touch behavior:

```ts
const dragBehavior = drag()
  .touchable(true) // force enable touch
  .filter((event) => !event.ctrlKey) // ignore ctrl+click
```

## Brush

Create rectangular selection regions:

```ts
import { brush, brushX, brushY } from '@ts-charts/brush'
import { select } from '@ts-charts/selection'

// 2D brush
const brush2d = brush()
  .extent([[0, 0], [960, 500]])
  .on('brush', (event) => {
    const [[x0, y0], [x1, y1]] = event.selection
    // filter data within selection bounds
  })
  .on('end', (event) => {
    if (!event.selection) return // cleared
  })

select('svg').append('g').call(brush2d)

// 1D horizontal brush
const brushHorizontal = brushX()
  .extent([[0, 0], [960, 500]])
  .on('brush', (event) => {
    const [x0, x1] = event.selection
  })
```

## Zoom

Pan and zoom with mouse wheel, pinch, and drag:

```ts
import { zoom, zoomIdentity, zoomTransform } from '@ts-charts/zoom'
import { select } from '@ts-charts/selection'

const zoomBehavior = zoom()
  .scaleExtent([0.5, 10])  // min/max zoom
  .translateExtent([[0, 0], [960, 500]]) // pan bounds
  .on('zoom', (event) => {
    const { x, y, k } = event.transform
    select('g').attr('transform', event.transform)
  })

select('svg').call(zoomBehavior)

// programmatic zoom
select('svg')
  .transition()
  .call(zoomBehavior.transform, zoomIdentity.scale(2))
```

### Zoom Transform

The zoom transform object represents a 2D transformation:

```ts
import { zoomIdentity } from '@ts-charts/zoom'

const t = zoomIdentity
  .translate(100, 50)
  .scale(2)

t.k // 2 (scale factor)
t.x // 100 (translate x)
t.y // 50 (translate y)

// apply to a point
t.apply([10, 20]) // [120, 90]

// invert a point
t.invert([120, 90]) // [10, 20]
```

## Event Dispatch

All interaction modules use the dispatch system for event handling:

```ts
import { dispatch } from '@ts-charts/dispatch'

const d = dispatch('start', 'update', 'end')

d.on('start', () => console.log('started'))
d.on('update', (value) => console.log('value:', value))
d.on('end', () => console.log('ended'))

d.call('start')
d.call('update', null, 42)
d.call('end')
```
