import { isoSpecifier } from './isoFormat.ts'
import { utcParse } from './defaultLocale.ts'

function parseIsoNative(string: string): Date | null {
  const date = new Date(string)
  return isNaN(+date) ? null : date
}

const parseIso: (string: string) => Date | null = +new Date('2000-01-01T00:00:00.000Z')
    ? parseIsoNative
    : utcParse(isoSpecifier)

export default parseIso
