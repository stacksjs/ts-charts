# Ease

Easing functions for smooth transitions and animations.

## Installation

```bash
bun add @ts-charts/ease
```

## Exports

`easeLinear`, `easeQuad`, `easeQuadIn`, `easeQuadOut`, `easeQuadInOut`, `easeCubic`, `easeCubicIn`, `easeCubicOut`, `easeCubicInOut`, `easePoly`, `easePolyIn`, `easePolyOut`, `easePolyInOut`, `easeSin`, `easeSinIn`, `easeSinOut`, `easeSinInOut`, `easeExp`, `easeExpIn`, `easeExpOut`, `easeExpInOut`, `easeCircle`, `easeCircleIn`, `easeCircleOut`, `easeCircleInOut`, `easeBounce`, `easeBounceIn`, `easeBounceOut`, `easeBounceInOut`, `easeBack`, `easeBackIn`, `easeBackOut`, `easeBackInOut`, `easeElastic`, `easeElasticIn`, `easeElasticOut`, `easeElasticInOut`

**Types:** `BackEasingFn`, `ElasticEasingFn`, `PolyEasingFn`

## Usage

```ts
import { easeCubicInOut, easeBounce, easeElastic } from '@ts-charts/ease'

easeCubicInOut(0.5)  // 0.5 — smooth in-out
easeBounce(0.8)      // bouncing effect
easeElastic(0.9)     // elastic spring
```
