import { tpmt } from './math.ts'

export interface ElasticEasingFn {
  (t: number): number
  amplitude(a: number): ElasticEasingFn
  period(p: number): ElasticEasingFn
}

const tau: number = 2 * Math.PI
const amplitude: number = 1
const period: number = 0.3

export const elasticIn: ElasticEasingFn = (function custom(a: number, p: number): ElasticEasingFn {
  const s: number = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau)

  function elasticIn(t: number): number {
    return a * tpmt(-(--t)) * Math.sin((s - t) / p)
  }

  elasticIn.amplitude = function (a: number): ElasticEasingFn { return custom(a, p * tau) }
  elasticIn.period = function (p: number): ElasticEasingFn { return custom(a, p) }

  return elasticIn as ElasticEasingFn
})(amplitude, period)

export const elasticOut: ElasticEasingFn = (function custom(a: number, p: number): ElasticEasingFn {
  const s: number = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau)

  function elasticOut(t: number): number {
    return 1 - a * tpmt(t = +t) * Math.sin((t + s) / p)
  }

  elasticOut.amplitude = function (a: number): ElasticEasingFn { return custom(a, p * tau) }
  elasticOut.period = function (p: number): ElasticEasingFn { return custom(a, p) }

  return elasticOut as ElasticEasingFn
})(amplitude, period)

export const elasticInOut: ElasticEasingFn = (function custom(a: number, p: number): ElasticEasingFn {
  const s: number = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau)

  function elasticInOut(t: number): number {
    return ((t = t * 2 - 1) < 0
      ? a * tpmt(-t) * Math.sin((s - t) / p)
      : 2 - a * tpmt(t) * Math.sin((s + t) / p)) / 2
  }

  elasticInOut.amplitude = function (a: number): ElasticEasingFn { return custom(a, p * tau) }
  elasticInOut.period = function (p: number): ElasticEasingFn { return custom(a, p) }

  return elasticInOut as ElasticEasingFn
})(amplitude, period)
