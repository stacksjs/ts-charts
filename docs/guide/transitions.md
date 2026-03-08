# Transitions

Transitions (from `@ts-charts/transition`) animate changes to DOM elements over time using interpolation.

## Basic Transition

```ts
import { select } from 'ts-charts'

select('circle')
  .transition()
  .duration(750)
  .attr('cx', 300)
  .attr('fill', 'red')
```

## Easing

Control the pacing of the animation with easing functions:

```ts
import { select, easeBounce, easeCubicInOut } from 'ts-charts'

select('circle')
  .transition()
  .duration(1000)
  .ease(easeBounce)
  .attr('cy', 200)
```

## Delays and Staggering

```ts
selectAll('rect')
  .transition()
  .delay((_, i) => i * 100)
  .duration(500)
  .attr('height', d => d * 3)
```

## Chaining Transitions

```ts
select('circle')
  .transition()
  .duration(500)
  .attr('r', 50)
  .transition()
  .duration(500)
  .attr('fill', 'orange')
```

## Key Exports

`transition`, `Transition`, `active`, `interrupt`

See the full [Transition API Reference](/api/transition) for details.
