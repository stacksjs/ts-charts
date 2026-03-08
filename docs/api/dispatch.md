# Dispatch

Named event dispatching for decoupled communication between components.

## Installation

```bash
bun add @ts-charts/dispatch
```

## Exports

`dispatch`

**Classes:** `Dispatch`

## Usage

```ts
import { dispatch } from '@ts-charts/dispatch'

const d = dispatch('start', 'end')

d.on('start', () => {
  console.log('started')
})

d.on('end', () => {
  console.log('ended')
})

d.call('start', this)
d.call('end', this)
```
