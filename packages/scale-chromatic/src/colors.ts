export default function colors(specifier: string): string[] {
  const n = specifier.length / 6 | 0
  const colors: string[] = new Array(n)
  let i = 0
  // eslint-disable-next-line pickier/no-unused-vars
  while (i < n) colors[i] = `#${specifier.slice(i * 6, ++i * 6)}`
  return colors
}
