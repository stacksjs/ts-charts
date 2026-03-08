# Timer

Timer utilities for animation scheduling using requestAnimationFrame.

## Installation

```bash
bun add @ts-charts/timer
```

## Exports

`now`, `timer`, `timerFlush`, `timeout`, `interval`

**Classes:** `Timer`

## Usage

```ts
import { timer, timeout, interval, now } from '@ts-charts/timer'

// run continuously
const t = timer((elapsed) => {
  console.log(elapsed)
  if (elapsed > 1000) t.stop()
})

// run once after delay
timeout(() => {
  console.log('fired after 500ms')
}, 500)

// run repeatedly
const i = interval((elapsed) => {
  console.log('tick', elapsed)
  if (elapsed > 3000) i.stop()
}, 1000)

// current time
now()  // high-resolution timestamp
```
