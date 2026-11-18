# @ts-charts/plot

Finished charts, rendered to a string of SVG.

The other packages are D3's toolbox: a scale, a line, an axis, each one piece of a chart. `@ts-charts/plot` assembles those pieces into complete charts with opinions about how they look. It returns markup instead of mutating a DOM, so the same call renders on a server, in a worker, or in a browser behind `innerHTML`.

## Installation

```bash
bun add @ts-charts/plot
```

## Exports

`probabilityChart`, `resolveLabelPositions`

## `probabilityChart`

A chart of how likely each outcome has been over time, drawn the way a prediction market draws a game. Each outcome gets:

- one line in its own colour, stepped by default;
- a soft gradient under the line;
- a dot on its latest value;
- its name above its current probability on the right.

```ts
import { probabilityChart } from '@ts-charts/plot'

const { svg, labels } = probabilityChart({
  width: 720,
  height: 320,
  series: [
    { id: 'lal', label: 'LAL', color: '#552583', points: lakers },
    { id: 'cha', label: 'CHA', color: '#1d1160', points: hornets },
  ],
  domain: [openedAt, Date.now()],
  grid: [0.25, 0.5, 0.75],
})

element.innerHTML = svg
```

`points` are `[time, value]` pairs, oldest first, with the value between 0 and 1. Time can be in any increasing unit, such as seconds or milliseconds.

The chart is sized in real pixels rather than stretched by a `viewBox`, so text and strokes stay crisp. Re-render it when its container resizes.

### Options

| Option | Default | |
|---|---|---|
| `series` | | Lines to draw: `id`, `label`, `color`, `points`, and optionally `fill: false` |
| `width`, `height` | | Pixel size of the whole chart, labels included |
| `labelWidth` | `120` | Pixels reserved on the right for end labels. `0` draws none |
| `curve` | `'step'` | `'step'`, `'linear'` or `'monotone'` |
| `domain` | data span | Time span drawn |
| `yDomain` | `[0, 1]` | Value span drawn |
| `extendTo` | domain end | Holds each line's last value out to this time, usually now |
| `grid` | none | Dashed reference lines at these values |
| `format` | whole percent | Formats a value for its end label |
| `fillOpacity` | `0.18` | Opacity at the top of each fill gradient |
| `strokeWidth` | `2.5` | Line width |
| `title` | | Accessible name. The labels' values are appended |
| `idPrefix` | `'plot'` | Keeps gradient ids apart when one page has several charts |

The result also returns `labels`, which holds each series' end label: its text, its colour, and where it landed. A caller that wants HTML labels can pass `labelWidth: 0` and draw them itself.

## `resolveLabelPositions`

```ts
resolveLabelPositions([100, 110], 50, 0, 300) // [100, 150]
```

Spaces label positions at least `gap` apart within `top`..`bottom`, keeping each as close to where it wanted to be as the bounds allow. The chart uses it so that two outcomes priced 52% and 48% do not print one label over the other.
