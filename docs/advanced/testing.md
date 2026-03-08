# Testing

ts-charts uses Bun's built-in test runner for all ~3,500 tests across 30 packages. Tests run fast with zero external test dependencies.

## Running Tests

```bash
# all tests
bun test

# single package
bun test packages/scale

# specific test file
bun test packages/array/test/mean.test.ts

# with filter
bun test --filter "scaleLinear"
```

## Test Setup

DOM-dependent packages use `very-happy-dom` for browser API simulation. The root `test/setup.ts` is preloaded via `bunfig.toml`:

```toml
# bunfig.toml
[test]
preload = ["./test/setup.ts"]
```

The setup file provides `document`, `window`, `Element`, and other DOM globals:

```ts
import { Window } from 'very-happy-dom'

const win = new Window({ url: 'http://localhost' })
globalThis.window = win
globalThis.document = win.document
globalThis.Element = win.Element
// ... etc
```

## Writing Tests

Tests use `bun:test` with `describe`, `it`, and `expect`:

```ts
import { describe, it, expect } from 'bun:test'
import { scaleLinear } from '../src'

describe('scaleLinear', () => {
  it('maps domain to range', () => {
    const s = scaleLinear().domain([0, 100]).range([0, 960])
    expect(s(0)).toBe(0)
    expect(s(50)).toBe(480)
    expect(s(100)).toBe(960)
  })

  it('clamps when enabled', () => {
    const s = scaleLinear().domain([0, 1]).range([0, 100]).clamp(true)
    expect(s(2)).toBe(100)
    expect(s(-1)).toBe(0)
  })
})
```

## Floating Point Comparisons

For numeric precision, use a delta check instead of exact equality:

```ts
function assertInDelta(actual: number, expected: number, delta = 1e-6): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

it('computes area', () => {
  assertInDelta(polygonArea(polygon), 3.5, 1e-6)
})
```

## Timezone-Dependent Tests

Some time and format tests depend on a specific timezone. Set it before running:

```bash
TZ=America/Los_Angeles bun test packages/time
TZ=America/Los_Angeles bun test packages/time-format
```

## Snapshot Tests

Axis and geo packages include snapshot tests that verify SVG output against expected strings:

```ts
it('renders axis correctly', () => {
  const scale = scaleLinear().domain([0, 1]).range([0, 100])
  const g = select(document.body).append('svg').append('g')
  g.call(axisBottom(scale))

  const path = g.select('.domain').attr('d')
  expect(path).toBe('M0.5,6V0.5H100.5V6')
})
```

## Test Coverage

Run with coverage to see what's covered:

```bash
bun test --coverage
```
