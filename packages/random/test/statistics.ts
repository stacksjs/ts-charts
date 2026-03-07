import { mean } from '@ts-charts/array'

export function kurtosis(numbers: number[]): number {
  const m = mean(numbers) as number
  let sum4 = 0
  let sum2 = 0
  let i = -1
  const n = numbers.length

  while (++i < n) {
    const v = numbers[i] - m
    sum2 += v * v
    sum4 += v * v * v * v
  }

  return (1 / n) * sum4 / Math.pow((1 / n) * sum2, 2) - 3
}

export function skewness(numbers: number[]): number {
  const m = mean(numbers) as number
  let sum3 = 0
  let sum2 = 0
  let i = -1
  const n = numbers.length

  while (++i < n) {
    const v = numbers[i] - m
    sum2 += v * v
    sum3 += v * v * v
  }

  return (1 / n) * sum3 / Math.pow((1 / (n - 1)) * sum2, 3 / 2)
}
