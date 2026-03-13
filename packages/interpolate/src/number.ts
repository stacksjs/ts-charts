export default function interpolateNumber(a: number | string, b: number | string): (t: number) => number {
  // eslint-disable-next-line pickier/no-unused-vars
  let na = +a
  // eslint-disable-next-line pickier/no-unused-vars
  let nb = +b
  return function (t: number): number {
    return na * (1 - t) + nb * t
  }
}
