export default function interpolateNumber(a: number | string, b: number | string): (t: number) => number {
  let na = +a
  let nb = +b
  return function (t: number): number {
    return na * (1 - t) + nb * t
  }
}
