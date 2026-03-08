# Data Joins

Data joins are the core pattern for binding data to DOM elements. They let you create, update, and remove elements based on data.

## The Join Pattern

```ts
import { select } from 'ts-charts'

const data = [10, 20, 30, 40, 50]

select('svg')
  .selectAll('rect')
  .data(data)
  .join('rect')
  .attr('x', (_, i) => i * 60)
  .attr('y', d => 200 - d * 3)
  .attr('width', 50)
  .attr('height', d => d * 3)
  .attr('fill', 'steelblue')
```

## Enter, Update, Exit

For more control, use the explicit enter/update/exit pattern:

```ts
const bars = select('svg')
  .selectAll('rect')
  .data(data)

// enter: new elements
bars.enter()
  .append('rect')
  .attr('fill', 'steelblue')

// update: existing elements
bars.attr('height', d => d * 3)

// exit: removed elements
bars.exit().remove()
```

## Key Functions

The `join` method is the modern, simplified approach that handles enter, update, and exit in one call. You can also pass functions for fine-grained control:

```ts
selection
  .data(data)
  .join(
    enter => enter.append('rect').attr('fill', 'green'),
    update => update.attr('fill', 'blue'),
    exit => exit.remove(),
  )
```
