export default function colors(s: string): string[] {
  return s.match(/.{6}/g)!.map(function (x: string): string {
    return '#' + x
  })
}
