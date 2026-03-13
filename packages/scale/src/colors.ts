export default function colors(s: string): string[] {
  // eslint-disable-next-line pickier/no-unused-vars
  return s.match(/.{6}/g)!.map(function (x: string): string {
    // eslint-disable-next-line pickier/no-unused-vars
    return `#${x}`
  })
}
