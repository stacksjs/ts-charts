export default function formatGroup(grouping: number[], thousands: string): (value: string, width: number) => string {
  return function (value: string, width: number): string {
    let i = value.length
    const t: string[] = []
    let j = 0
    let g = grouping[0]
    let length = 0

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length)
      t.push(value.substring(i -= g, i + g))
      if ((length += g + 1) > width) break
      g = grouping[j = (j + 1) % grouping.length]
    }

    return t.reverse().join(thousands)
  }
}
