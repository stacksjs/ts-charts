export default function interpolateDate(a: Date | number, b: Date | number): (t: number) => Date {
  const d = new Date()
  const na = +a
  const nb = +b
  return function (t: number): Date {
    d.setTime(na * (1 - t) + nb * t)
    return d
  }
}
