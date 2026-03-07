export default function interpolateRound(a: number, b: number): (t: number) => number {
  const na = +a
  const nb = +b
  return function (t: number): number {
    return Math.round(na * (1 - t) + nb * t)
  }
}
