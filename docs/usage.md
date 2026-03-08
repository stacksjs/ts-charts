# Usage Examples

## Bar Chart Data Preparation

```ts
import { scaleBand, scaleLinear, max } from 'ts-charts'

const data = [
  { label: 'A', value: 30 },
  { label: 'B', value: 80 },
  { label: 'C', value: 45 },
  { label: 'D', value: 60 },
]

const x = scaleBand()
  .domain(data.map(d => d.label))
  .range([0, 400])
  .padding(0.1)

const y = scaleLinear()
  .domain([0, max(data, d => d.value)])
  .range([300, 0])
```

## Line Chart with Curve

```ts
import { line, curveCatmullRom, scaleLinear, scaleTime, extent } from 'ts-charts'

const data = [
  { date: new Date(2024, 0), value: 10 },
  { date: new Date(2024, 1), value: 25 },
  { date: new Date(2024, 2), value: 18 },
  { date: new Date(2024, 3), value: 35 },
]

const x = scaleTime()
  .domain(extent(data, d => d.date))
  .range([0, 500])

const y = scaleLinear()
  .domain([0, max(data, d => d.value)])
  .range([300, 0])

const lineGen = line()
  .x(d => x(d.date))
  .y(d => y(d.value))
  .curve(curveCatmullRom)

const pathData = lineGen(data)
```

## Pie Chart

```ts
import { pie, arc } from 'ts-charts'

const data = [10, 20, 30, 40]

const pieGen = pie().sort(null)
const arcs = pieGen(data)

const arcGen = arc()
  .innerRadius(50)
  .outerRadius(150)

const paths = arcs.map(d => arcGen(d))
```

## Color Scales

```ts
import { scaleSequential, scaleOrdinal } from 'ts-charts'
import { interpolateViridis, schemeCategory10 } from 'ts-charts'

const sequential = scaleSequential(interpolateViridis)
  .domain([0, 100])

sequential(50)  // color at midpoint

const categorical = scaleOrdinal(schemeCategory10)
categorical('apples')   // '#1f77b4'
categorical('oranges')  // '#ff7f0e'
```

## Force-Directed Graph

```ts
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'ts-charts'

const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
const links = [
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' },
  { source: 'c', target: 'd' },
]

const simulation = forceSimulation(nodes)
  .force('link', forceLink(links).id(d => d.id))
  .force('charge', forceManyBody())
  .force('center', forceCenter(250, 250))
```

## Geographic Projection

```ts
import { geoMercator, geoPath } from 'ts-charts'

const projection = geoMercator()
  .scale(150)
  .translate([400, 300])

const pathGenerator = geoPath(projection)

// use with GeoJSON
const svgPath = pathGenerator(geojsonFeature)
```
