# Transition

Animated transitions for DOM elements using interpolation and easing.

## Installation

```bash
bun add @ts-charts/transition
```

## Exports

`transition`, `Transition`, `active`, `interrupt`

## Usage

```ts
import { select } from '@ts-charts/selection'
import { transition } from '@ts-charts/transition'
import { easeBounce } from '@ts-charts/ease'

// basic transition
select('circle')
  .transition()
  .duration(750)
  .attr('cx', 300)
  .attr('fill', 'red')

// named transition with easing
const t = transition('move')
  .duration(1000)
  .ease(easeBounce)

select('circle')
  .transition(t)
  .attr('cy', 200)

// interrupt active transitions
import { interrupt } from '@ts-charts/transition'
interrupt(node)

// get active transition
import { active } from '@ts-charts/transition'
const current = active(node, 'move')
```
