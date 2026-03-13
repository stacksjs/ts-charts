# Why ts-charts

D3.js is the gold standard for data visualization on the web. So why rewrite it?

## Full TypeScript with isolatedDeclarations

D3.js was written in JavaScript. Community-maintained `@types/d3` packages exist, but they often lag behind, have inaccuracies, and cannot leverage `isolatedDeclarations`. ts-charts is written in TypeScript from the source, so types are always accurate and complete.

```ts
// full IntelliSense, no @types packages needed
import { scaleLinear } from 'ts-charts'

const scale = scaleLinear()
  .domain([0, 100])
  .range([0, 500])

scale(50)  // TypeScript knows this returns number
```

## Tree-Shakeable ESM

Every package ships as pure ESM with proper `exports` field configuration. Bundlers can tree-shake unused exports effectively.

## Bun-First with Browser Support

ts-charts is developed and tested on Bun first, ensuring fast installs and runtime performance. It also works seamlessly in browser environments and other JavaScript runtimes.

## Single Import

Use the umbrella `ts-charts` package to access all 30 modules from one import, or install individual `@ts-charts/*` packages for minimal footprints.

## No Prototype Mutation Hacks

The original D3 relies on prototype mutation and monkey-patching (e.g., `d3-selection` extending `Selection.prototype` at import time). ts-charts uses clean, modern TypeScript patterns without hidden side effects.

## Zero External Dependencies

The entire library is self-contained. No transitive dependencies to audit, no supply chain concerns, no version conflicts.
