export default function formatNumerals(numerals: string[]): (value: string) => string {
  return function (value: string): string {
    return value.replace(/[0-9]/g, function (i: string): string {
      return numerals[+i]
    })
  }
}
