# Random

Random number generators for various probability distributions.

## Installation

```bash
bun add @ts-charts/random
```

## Exports

`randomUniform`, `randomInt`, `randomNormal`, `randomLogNormal`, `randomBates`, `randomIrwinHall`, `randomExponential`, `randomPareto`, `randomBernoulli`, `randomGeometric`, `randomBinomial`, `randomGamma`, `randomBeta`, `randomWeibull`, `randomCauchy`, `randomLogistic`, `randomPoisson`, `randomLcg`

**Types:** `RandomSource`, `RandomUniform`, `RandomInt`, `RandomNormal`, `RandomLogNormal`, `RandomBates`, `RandomIrwinHall`, `RandomExponential`, `RandomPareto`, `RandomBernoulli`, `RandomGeometric`, `RandomBinomial`, `RandomGamma`, `RandomBeta`, `RandomWeibull`, `RandomCauchy`, `RandomLogistic`, `RandomPoisson`

## Usage

```ts
import { randomNormal, randomUniform, randomLcg } from '@ts-charts/random'

const normal = randomNormal(0, 1)
normal()  // random value from N(0,1)

const uniform = randomUniform(0, 100)
uniform()  // random value between 0 and 100

// seeded random for reproducibility
const lcg = randomLcg(42)
const seeded = randomNormal.source(lcg)(0, 1)
seeded()  // deterministic random value
```
